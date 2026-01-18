import { supabase } from "./lib/supabase";
import Analyze from "./frontend/pages/Analyze";

function App() {

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">YouTube Analyzer</h1>
<Analyze/>
    </div>
  );
}

export default App;
