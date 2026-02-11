export async function analyzeYouTube(url){
    const response = await fetch(

        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({url}),
        }
    );
    if(!response.ok){
        throw new Error("Backend error");
    }
    return response.json();
}