import MatterJsDemo from "@/components/MatterJsDemo";
import { listS3ObjectUrls } from "@/components/aws_helper";

export default async function Home() {
  const k = await listS3ObjectUrls("resume/");

  return (
    <>
    <main id="skyscraper" className="h-full w-full">
      <MatterJsDemo blocks={k} />
    </main>
    </>
  );
}
