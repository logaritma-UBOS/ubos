import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need a server role key to bypass RLS since Webhook comes from external server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a production scenario, verify Mayar Webhook Signature here
    // const signature = req.headers.get('x-mayar-signature');
    
    // Typical Mayar webhook format: body.event, body.data
    const event = body.event || body.status; 
    
    // Check if event is PAID or success
    if (event === 'PAID' || event === 'payment.received' || body.status === 'success') {
      const payload = body.data || body;
      
      let customFieldObj: any = null;
      try {
        if (payload.custom_field) {
          customFieldObj = JSON.parse(payload.custom_field);
        }
      } catch (e) {
        // Not a JSON custom field, ignore
      }

      // Handle Investor Funding
      if (customFieldObj && customFieldObj.type === 'INVESTOR_FUNDING') {
        const amount = payload.amount || 0;
        const items = customFieldObj.items || 'Pendanaan Project';
        const email = payload.email || payload.customer?.email;
        const name = payload.name || payload.customer?.name || 'Investor';

        if (!email) {
          console.error('Webhook payload missing email for investor:', payload);
          return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        // 1. Insert Cash Transaction
        await supabaseAdmin.from('cash_transactions').insert([{
          transaction_date: new Date().toISOString().split('T')[0],
          type: 'IN',
          category: 'Inject Modal Investor',
          description: items,
          amount: amount
        }]);

        // 2. Create User Account in Supabase Auth
        // Generate a standard password for the investor
        const password = 'LogaritmaInvestor123!';
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { name: name }
        });

        if (userError) {
          // If user exists, we might just want to update their role. 
          // For simplicity, we assume they might already have an account.
          console.error('Failed to create investor user (may already exist):', userError);
        }

        const userId = userData?.user?.id;

        // 3. Create or update profile in merchants
        if (userId) {
          const { error: profileError } = await supabaseAdmin.from('merchants').upsert({
            id: userId, // Primary key
            user_id: userId,
            nama_usaha: name,
            whatsapp: payload.mobile || payload.customer?.phone,
            is_investor_view_only: true,
            is_admin: false,
            kategori_usaha: 'Investor',
            created_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          }, { onConflict: 'user_id' }); // Assuming user_id has unique constraint, or ID is used.
          
          if (profileError) {
             console.error('Failed to create merchant profile for investor:', profileError);
          }
        } else {
           // Fallback if user creation failed because they exist: fetch user by email
           // Supabase admin api to list users by email
           const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
           const existingUser = usersData.users.find(u => u.email === email);
           if (existingUser) {
              await supabaseAdmin.from('merchants').update({
                 is_investor_view_only: true
              }).eq('user_id', existingUser.id);
           }
        }

        return NextResponse.json({ success: true, message: 'Investor funding processed successfully' });
      }

      // Handle Regular Merchant Subscription Renewal
      const merchantId = payload.custom_field || payload.reference_id;
      
      if (!merchantId) {
        console.error('Webhook payload missing merchantId identifier:', body);
        return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
      }

      // Fetch current merchant
      const { data: merchant, error: fetchError } = await supabaseAdmin
        .from('merchants')
        .select('trial_expires_at')
        .eq('id', merchantId)
        .single();
        
      if (fetchError || !merchant) {
        console.error('Failed to fetch merchant for webhook:', fetchError);
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
      }

      // Calculate new expiration date
      let expiresDate = new Date();
      if (merchant.trial_expires_at) {
        const currentExpiry = new Date(merchant.trial_expires_at);
        if (currentExpiry.getTime() > expiresDate.getTime()) {
          // If still active, add 30 days to the remaining active days
          expiresDate = currentExpiry;
        }
      }
      // Add 30 days
      expiresDate.setDate(expiresDate.getDate() + 30);

      // Update merchant
      const { error: updateError } = await supabaseAdmin
        .from('merchants')
        .update({ trial_expires_at: expiresDate.toISOString() })
        .eq('id', merchantId);

      if (updateError) {
        console.error('Failed to update merchant trial_expires_at:', updateError);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'License renewed for 30 days' });
    }

    // Acknowledge other events without action
    return NextResponse.json({ received: true, event: event });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
