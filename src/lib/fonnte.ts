export async function sendFonnteWA(target: string, message: string) {
  const token = process.env.NEXT_PUBLIC_FONNTE_TOKEN || 'rw47gsoTHcy86wGbxAtW';
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending Fonnte WA:', error);
    return { status: false, error };
  }
}
