
import { BlogEntry } from "@/components/types";
import { store } from "@/components/aws_helper";
import Mainpage from "@/components/Mainpage";
import Headers from "@/components/Headers";


export default async function Blog() {
  // const token = context.req.cookies.token || "";
  // let data:UserData = {};
  // let blogs: BlogEntry[] = [];
  // let lastEntry = undefined;
  // try{
  //   const results = await store(undefined);
  //   if (results?.items)
  //   {
  //     blogs = results?.items as BlogEntry[];
  //   }
  //   if (results?.lastEvaluatedKey)
  //   {
  //     lastEntry = results?.lastEvaluatedKey.SK
  //   }
    
  // }
  // catch(error){
  //   console.error("Error fetching data: ", error);
  //   throw error;
  // }

  var lastEntry=undefined;

  return (
    <main className="font-[ClashDisplay-Regular] bg-white w-full min-h-screen text-black">
        <Headers />
        <Mainpage  
        lastEntry={lastEntry}
        />
    </main>
  );
}
