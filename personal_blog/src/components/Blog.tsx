"use client";
import { useState, useRef } from "react";
import Reac from "react";
import Xicon from "@/components/XIcon";
import PhotoIcon from "@/components/PhotoIcon";
import VideoIcon from "@/components/VideoIcon";
import LinkIcon from "@/components/LinkIcon";
import CodeIcon from "@/components/CodeIcon";
import ParagraphIcon from "@/components/ParagraphIcon";
import axios from "axios";
import Headers from "./Headers";

interface rawhtmltype {
  text: string[];
  title: string;
  blurb: string;
  image: string;
}

const regex = /(?<=[^\n])\n|\n(?=[^\n])|\n\n(?=\n)/;

const Blog: React.FC<{
  slug: string;
  verified: boolean;
  rawhtml: rawhtmltype;
  ky: string;
}> = ({ slug, verified, rawhtml, ky }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coord, setCoord] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [location, setLocation] = useState(0);

  const buttonRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLDivElement>(null);
  const testing2Ref = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const menubarRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null);
  const titleTxtRef = useRef<HTMLHeadingElement>(null);

  let dic: string[] = [];

  const editMode = () => {
    var content = document.getElementById("main");
    if (content) {
      content.contentEditable = "true";
    }
  };
  const insertAfter = (newNode: HTMLElement, existingNode: HTMLElement) => {
    existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
  };

  const submitInput = (event: React.MouseEvent) => {
    imageInputRef.current?.click();
    event.preventDefault();
  };

  const saveArticle = async () => {
    const element = document.getElementById("main");
    const titleEle = document.getElementById("titletxt");
    if (element) {
      element.contentEditable = "false";
    } else {
      alert("error finding table!");
      return;
    }
    const rhtml = element.innerHTML;
    try {
      setLoading(true);
      const { url } = await fetch(`/api/url`).then((res) => res.json());

      // const htmlUrl = url.split('?')[0];
      const title = titleEle?.innerText;
      const imageurls: string[] = [];
      const contentArray: string[] = [];
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          if (elem.tagName === "DIV") {
            if (elem.className.includes("code-block")) {
              try{
                const firstDivChild = elem.querySelector('div');
                if (firstDivChild){
                  firstDivChild.contentEditable= 'false';
                }
              }
              catch{
                alert('error finding contenteditable');
              }
              contentArray.push("cccc" + elem.innerHTML);
            } else {
              contentArray.push(elem.innerHTML);
            }
          } else if (elem.tagName === "IMG") {
            contentArray.push((elem as HTMLImageElement).src);
            imageurls.push((elem as HTMLImageElement).src);
          }
          else if (elem.className.includes('embed-block')) {
            const iframe = elem.querySelector('iframe');
            if (iframe) {
              contentArray.push('embed:' + iframe.src);
            }
          }
        }
      });

      const contentArrayJson = JSON.stringify(contentArray);
      const parms = {
        key: ky,
      };
      await axios.post("/api/delete", parms);
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: contentArrayJson,
      });
      const htmlUrl = url.split("?")[0];
      let prms = {
        blogid: slug,
        text: htmlUrl,
        image: imageurls[0],
      };
      await axios.post(`/api/update`, prms);
    } catch (e) {
      alert(e);
      setLoading(false);
    } finally {
      setLoading(false);
      setSaved(true);
    }
  };

  const submitForm = async (event: React.ChangeEvent) => {
    event.preventDefault();
    const file = imageInputRef.current?.files?.[0];
    const { url } = await fetch(`/api/url`).then((res) => res.json());

    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: file,
    });

    const imageUrl = url.split("?")[0];

    const parentElement = testing2Ref.current as HTMLElement;
    const referenceNode = parentElement.children[location] as HTMLElement;
    const newElement = document.createElement("img");
    const emptyLine = document.createElement("div");
    emptyLine.appendChild(document.createElement("br"));
    newElement.setAttribute("src", imageUrl);

    insertAfter(newElement, referenceNode);
    insertAfter(emptyLine, newElement);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const button = buttonRef.current;
    const menubar = menubarRef.current;
    const target = event.target as Node;
    const tf = menubar?.classList.contains("opacity-1");

    if (
      menubar &&
      button &&
      !menubar.contains(target) &&
      !button.contains(target) &&
      tf
    ) {
      setIsMenuVisible(false);
      flip45(iconRef.current);
    }

    let indx = 0;
    const childNodes = testing2Ref.current?.childNodes;
    if (childNodes) {
      childNodes.forEach((j) => {
        if (j.contains(target)) {
          setCoord((j as Element).getBoundingClientRect().y);
          setLocation(indx);
        }
        indx += 1;
      });
    }
  };

  const handleInput = () => {
    const text = testing2Ref.current?.innerText;
    const lines = text?.split(regex).map((s) => (s === "\n" ? "" : s));
    let b = 0;
    if (lines!.length < dic.length) {
      setLocation(lines!.length - 1);
    } else {
      for (const a of lines!) {
        if (dic[b] != undefined) {
          if (a != dic[b]) {
            setLocation(b);
            break;
          }
        } else {
          setLocation(b);
        }
        b += 1;
      }
    }
    dic = lines!;
  };

  const flip = () => {
    setIsMenuVisible(!isMenuVisible);
    flip45(iconRef.current);
  };

  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const flip45 = (item: HTMLElement | null) => {
    if (item?.classList.contains("rotate-45")) {
      item.classList.remove("rotate-45");
    } else {
      item?.classList.add("rotate-45");
    }
  };

  // console.log("rrawthml", rawhtml);
  return (
    <main className="font-[ClashDisplay-Regular] bg-white w-full min-h-screen text-black dark:bg-black dark:text-white relative">
      <Headers 
      back={true}
      />
      {verified && (
        <span
          onClick={() => {
            const main = document.getElementById("main");
            if (main) {
              main.contentEditable = "true";
            }
          }}
          className="absolute right-5 text-lg"
        >
          EDIT
        </span>
      )}
      <div className="w-[90vw] wide:w-1/2 m-auto text-2xl text-center">
        <br />
        <h3
          ref={titleTxtRef}
          id="titletxt"
          className="text-titlexl mb-5 leading-relaxed"
        >
          {rawhtml?.title}
        </h3>
        <h3 className="text-sml outline-black border-b-[1px]">
          {rawhtml?.blurb}
        </h3>
        <img
          className="w-[75%] m-auto"
          src={rawhtml?.image || ""}
          alt="blog header"
          width={800}
          height={800}
        />
      </div>
      <div
        ref={testing2Ref}
        id="main"
        className="w-[90vw] wide:w-read m-auto text-2xl"
      >
        <br />

        {rawhtml?.text?.map((paragraph, index) => {
        paragraph = paragraph.replace("&nbsp;", "");

        // 1) It's an image if starts with https:
        if (paragraph.startsWith("https:")) {
          return (
            <img
              key={index}
              src={paragraph}
              alt={`image-${index}`}
              className="w-full h-auto my-4"
            />
          );
        }

        // 2) Embed block if starts with 'embed:'
        else if (paragraph.startsWith("embed:")) {
          const embedUrl = paragraph.replace("embed:", "");
          return (
            <div key={index} className="embed-block flex justify-center my-4">
              <iframe
                src={embedUrl}
                width="560"
                height="315"
                allowFullScreen
                className="border-0"
              />
            </div>
          );
        }

        // 3) Code block
        else if (paragraph.startsWith("cccc")) {
          return (
            <div
              key={index}
              className="code-block"
              dangerouslySetInnerHTML={{ __html: paragraph.split("cccc")[1] }}
            />
          );
        }

        // etc...
        else {
          return (
            <div
              key={index}
              className="text-vsml leading-9"
              style={{ textIndent: "2em" }}
            >
              {paragraph}
            </div>
          );
        }
      })}
      </div>
      {verified && !saved && (
        <div
          ref={saveBtnRef}
          id="savebtn"
          className={
            "w-[150px] h-[42px] absolute top-[172px] right-bbl flex outline outline-black outline-1 duration-1000"
          }
        >
          {loading ? (
            "loading"
          ) : (
            <button className="w-full h-full z-10" onClick={saveArticle}>
              save this bitch
            </button>
          )}
        </div>
      )}
      {verified && !saved && (
        <div
          ref={buttonRef}
          id="button"
          className={`w-[42px] h-[42px] absolute top-[172px] left-svg flex outline outline-black outline-1 duration-1000 `}
        >
          <button className="w-full h-full z-10" onClick={flip}>
            <Xicon />
          </button>
          <div
            ref={menubarRef}
            id="menubar"
            className={`w-full absolute left-0 top-0 h-auto mx-auto grid grid-rows-5 gap-[20px] transition-all duration-1000 transform ${
              isMenuVisible
                ? "translate-y-[64px] opacity-1 pointer-events-auto"
                : "-translate-y-full opacity-0 pointer-events-none"
            }`}
          >
            <form id="imageform" onSubmit={upload}>
              <input
                ref={imageInputRef}
                id="imageinput"
                type="file"
                accept="image/*"
                onChange={submitForm}
                hidden
              />
              <button
                id="imagebutton"
                type="button"
                title="add photo"
                onClick={submitInput}
              >
                <PhotoIcon />
              </button>
            </form>
            <button title="add video">
              <VideoIcon />
            </button>
            <button title="insert embedded link">
              <LinkIcon />
            </button>
            <button title="insert code block">
              <CodeIcon />
            </button>
            <button title="new section">
              <ParagraphIcon />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Blog;
