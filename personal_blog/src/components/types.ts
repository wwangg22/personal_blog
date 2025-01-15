
export interface BlogEntry {
    metadata: string;
    GSI1PK: string;
    date: string;
    image: string;
    SK: string;
    GSI1SK: string;
    PK: string;
    rawHTML: string;
    author: string;
    title: string;
  }

export interface DataProps {
    blogs?: BlogEntry[];
    lastEntry?: {
      PK: string;
      SK: string;
    };
    rawhtml?: BlogProps;
}
export interface BlogProps {
  text: string[], 
  title:string, 
  blurb:string, 
  image?:string | undefined,
  date?:string | undefined
}