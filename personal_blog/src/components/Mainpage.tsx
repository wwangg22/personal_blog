'use client'
import React, { useState, useEffect } from "react";
import Articles from "./Articles";
import { BlogEntry } from "@/components/types";
import axios from "axios";


interface MainpageProps {
  // blogs: BlogEntry[] | undefined;
  lastEntry: string | undefined;
}

const Mainpage: React.FC<MainpageProps> = ({lastEntry: initialLastEntry }) => {
  const [blogs, setBlogs] = useState<BlogEntry[] | undefined>([]);
  const [lastEntry, setLastEntry] = useState(initialLastEntry);
  // console.log(lastEntry)
  // Function to fetch more blogs
  const fetchMoreBlogs = async () => {
    // Replace `/api/more-blogs` with your actual API endpoint
    // Ensure the API expects `startKey` query param for pagination
    var url1 = `/api/get`;
    if (lastEntry){
      var url1 = `/api/get?startkey=${encodeURIComponent(lastEntry)}`;
    }

      // console.log('last entry', lastEntry)
      const response = await axios.get(url1);
      try {
        const fetched_blogs = JSON.parse(response.data.data) as BlogEntry[];
        if (response.data.lastEvaluatedKey) {
          const lastEntry1 = JSON.parse(response.data.lastEvaluatedKey)
          setLastEntry(lastEntry1.SK);
        }
        else{
          setLastEntry(undefined);
        }
        if (fetched_blogs) {
          // console.log('reset')
          if (blogs?.indexOf(fetched_blogs[0]) == -1){
            setBlogs([...blogs, ...fetched_blogs]);
          }
        }
      }
      catch(e){
        console.log(e);
      }
      // Assuming `data.blogs` is the array of new blogs and `data.lastEntry` is the new last entry
    
  };
  useEffect(()=>{
    fetchMoreBlogs();
  },[]);

  return (
    <>
      <div className="grid grid-rows-auto w-[90vw] md:w-[75vw] wide:w-1/2 mx-auto gap-3 mt-5 bg-white dark:bg-black dark:text-white">
        {blogs?.map((blog) => (
          <Articles
            key={blog.SK}
            title={blog.title || "no title available"}
            author={blog.author || "no author available"}
            date={new Date(blog.date).toDateString() || "no date available"}
            id={blog.SK.split('#')[1]}
            image={blog.image || ""}
          />
        ))}

        <div className="w-full h-36 flex items-center justify-center">
          {lastEntry && <button onClick={fetchMoreBlogs} className="m-auto text-sml">Show more</button>}
        </div>
      </div>
    </>
  );
};

export default Mainpage;
