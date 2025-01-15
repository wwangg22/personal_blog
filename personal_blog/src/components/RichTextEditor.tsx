'use client';
import React, { useEffect, useState, useRef } from 'react';
import Xicon from '@/components/XIcon';
import PhotoIcon from '@/components/PhotoIcon';
import VideoIcon from '@/components/VideoIcon';
import LinkIcon from '@/components/LinkIcon';
import CodeIcon from '@/components/CodeIcon';
import ParagraphIcon from '@/components/ParagraphIcon';
import axios from 'axios';
import type { JwtPayload } from 'jsonwebtoken';

export interface UserData extends JwtPayload {
  email?: string;
  username?: string;
}

const regex = /(?<=[^\n])\n|\n(?=[^\n])|\n\n(?=\n)/;

function RichTextEditor({ userdata }: UserData) {
  const [numparagraphs, setNumparagraphs] = useState(3);
  const [location, setLocation] = useState(0);
  const [coord, setCoord] = useState(0);
  const [imageurls, setImageurls] = useState<any[]>([]);
  const [scroll, setScroll] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const buttonRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLDivElement>(null);
  const testing2Ref = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const menubarRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null);
  const titleTxtRef = useRef<HTMLHeadingElement>(null);

  let dic: string[] = [];

  useEffect(() => {
    if (!saved && buttonRef.current && saveBtnRef.current) {
      const transformValue = `translateY(${
        coord - 212.8000030517578 + 42 + window.scrollY
      }px)`;
      buttonRef.current.style.transform = transformValue;
      saveBtnRef.current.style.transform = transformValue;
    }
  }, [coord, saved]);

  useEffect(() => {
    const testing2Element = testing2Ref.current;

    if (testing2Element) {
      testing2Element.addEventListener('input', handleInput);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('mouseup', handleMouseUp);
      if (testing2Element) {
        testing2Element.removeEventListener('input', handleInput);
      }
    };
  }, []);

  const handleMouseUp = (e: MouseEvent) => {
    const target = e.target as Node;
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

  const submitInput = (event: React.MouseEvent) => {
    imageInputRef.current?.click();
    event.preventDefault();
  };

  const insertAfter = (newNode: HTMLElement, existingNode: HTMLElement) => {
    existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
  };

  const saveArticle = async () => {
    const element = testing2Ref.current;
    if (element) {
      element.contentEditable = 'false';
    } else {
      alert('error finding table!');
      return;
    }
    const rhtml = element.innerHTML;
    try {
      setLoading(true);
      const { url } = await fetch(`/api/url`).then((res) => res.json());
      

      // await fetch(url, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'text/plain',
      //   },
      //   body: rhtml,
      // });
      
      // const htmlUrl = url.split('?')[0];
      const title = titleTxtRef.current?.innerText;
      const contentArray: string[] = [];
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          if (elem.tagName === 'DIV') {
            if (elem.className.includes('code-block')) {
              try{
                const firstDivChild = elem.querySelector('div');
                if (firstDivChild){
                  firstDivChild.contentEditable= 'false';
                }
              }
              catch{
                alert('error finding contenteditable');
              }
              contentArray.push('cccc' + elem.innerHTML);
            }
            else{
              contentArray.push(elem.innerHTML);
            }
          } else if (elem.tagName === 'IMG') {
            contentArray.push((elem as HTMLImageElement).src);
          }
        }
      });
      const contentArrayJson = JSON.stringify(contentArray);
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: contentArrayJson,
      });
      const htmlUrl = url.split('?')[0];
      let prms = {
        title: title,
        author: 'will',
        text: htmlUrl,
        images: imageurls,
      };
      await axios.post(`/api/upload`, prms);
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
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: file,
    });

    const imageUrl = url.split('?')[0];
    setImageurls((old) => [...old, imageUrl]);

    const parentElement = testing2Ref.current as HTMLElement;
    const referenceNode = parentElement.children[location] as HTMLElement;
    const newElement = document.createElement('img');
    const emptyLine = document.createElement('div');
    emptyLine.appendChild(document.createElement('br'));
    newElement.setAttribute('src', imageUrl);

    insertAfter(newElement, referenceNode);
    insertAfter(emptyLine, newElement);
  };

  const addCodeBlock = () => {
    event?.preventDefault();

    const parentElement = testing2Ref.current as HTMLElement;
    const referenceNode = parentElement.children[location] as HTMLElement;

    const newElement = document.createElement('div');
    const newElement2 = document.createElement('div');
    const emptyLine = document.createElement('div');

    emptyLine.appendChild(document.createElement('br'));
    newElement.className = 'code-block';
    newElement.setAttribute('contenteditable', 'false');
    newElement.appendChild(newElement2);
    newElement2.setAttribute('contenteditable', 'true');

    insertAfter(newElement, referenceNode);
    insertAfter(emptyLine, newElement);

  }

  const handleOutsideClick = (event: MouseEvent) => {
    const button = buttonRef.current;
    const menubar = menubarRef.current;
    const target = event.target as Node;
    const tf = menubar?.classList.contains('opacity-1');

    if (menubar && button && !menubar.contains(target) && !button.contains(target) && tf) {
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
    const lines = text?.split(regex).map((s) => (s === '\n' ? '' : s));
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
    if (item?.classList.contains('rotate-45')) {
      item.classList.remove('rotate-45');
    } else {
      item?.classList.add('rotate-45');
    }
  };

  return (
    <>
      {!saved && (
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
                ? 'translate-y-[64px] opacity-1 pointer-events-auto'
                : '-translate-y-full opacity-0 pointer-events-none'
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
            <button onClick = {addCodeBlock} title="insert code block">
              <CodeIcon />
            </button>
            <button title="new section">
              <ParagraphIcon />
            </button>
          </div>
        </div>
      )}
      {!saved && (
        <div
          ref={saveBtnRef}
          id="savebtn"
          className={
            'w-[150px] h-[42px] absolute top-[172px] right-bbl flex outline outline-black outline-1 duration-1000'
          }
        >
          {loading ? (
            'loading'
          ) : (
            <button className="w-full h-full z-10" onClick={saveArticle}>
              save this bitch
            </button>
          )}
        </div>
      )}
      <div className="w-1/2 m-auto text-2xl">
        <div
          ref={testing2Ref}
          id="testing2"
          className="outline-none outline-black border-b-[2px]"
          contentEditable={true}
        >
          <h3
            ref={titleTxtRef}
            id="titletxt"
            className="text-titlexl outline-black border-b-[1px]"
          >
            title
          </h3>
          <div>text here</div>
        </div>
      </div>
    </>
  );
}

export default RichTextEditor;
