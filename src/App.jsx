import { isEmptyObj } from "openai/_vendor/zod-to-json-schema/util.mjs";
import Analyze from "./frontend/pages/Analyze";
import { Jobs } from "openai/resources/fine-tuning.js";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-1">
      <Analyze />
    </div>
  );
}


export default App;