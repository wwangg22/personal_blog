
import { listS3ObjectFolders } from "../../components/aws_helper";
import axios from "axios";
import CadViewer from "@/components/cadviewer";
import { getFolders } from "@/components/file_manager";

export default async function Garage() {
  const debug = false;
  var filenames
  if (debug){
    filenames = await getFolders("public/stl/actuator");
  }
  else{
    filenames = await listS3ObjectFolders("public/stl/actuator");
  }
  var models;
  if (debug){
    models = await getFolders("public/stl");
    }
  else{
    models = await listS3ObjectFolders("public/stl");
  }

  return (
    <main>
      <CadViewer initialPath={filenames} models={models} debug={debug} />
    </main>
  );
}
