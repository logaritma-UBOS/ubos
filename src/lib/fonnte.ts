export async function sendFonnteWA(target: string, message: string) {
  try {
    const response = await fetch('/api/send-wa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send via Fonnte API Route');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending Fonnte WA, falling back to direct link:', error);
    
    // Fallback: Open direct WhatsApp link
    let finalPhone = target.replace(/\D/g, '');
    if (finalPhone.startsWith('0')) {
      finalPhone = '62' + finalPhone.substring(1);
    }
    
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    return { status: false, error };
  }
}
