
import { listS3ObjectFolders } from "../../components/aws_helper";
import CadViewer from "@/components/cadviewer";

export default async function Garage() {
  const filenames = await listS3ObjectFolders("public/stl/actuator");
  const models = await listS3ObjectFolders("public/stl");

  return (
    <main>
      <CadViewer initialPath={filenames} models={models} />
    </main>
  );
}
