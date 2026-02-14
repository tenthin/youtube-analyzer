export async function analyzeYouTube(url) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if(!response.ok){

      let message = "Server Error";
      
      try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
            message = response.statusText || message;
        }
        throw new Error(message);
    }
  return response.json();
}
