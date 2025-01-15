
import { getFiles, getFolders } from "@/components/file_manager";
import CadViewer from "@/components/cadviewer";

export default async function Debug() {
  const filenames = await getFiles("public/stl/actuator");
  const models = await getFolders("public/stl");
  // console.log(filenames);
  // console.log(models);
  return (
    <main>
      <CadViewer initialPath={filenames} models={models} debug={true} />
    </main>
  );
}
