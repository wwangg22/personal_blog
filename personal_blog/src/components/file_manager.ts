import fs from 'fs';
import path from 'path';

export default async function test() {
    const directoryPath = path.join(process.cwd(), 'public/circular'); // Adjust the path to your directory
    fs.readdir(directoryPath, (err, files) => {
        //console.log(files);
      return files;
      //console.log(files);
    });
    return [];
}
export async function getFolders(name: string) {
    const directoryPath = path.join(process.cwd(), name);
    var  filenames = await fs.readdirSync(directoryPath);
    var newFiles =[];
    for (var i = 0; i < filenames.length; i++) {
        if (filenames[i].indexOf('.') == -1) {
            console.log(filenames[i]);
            newFiles.push(name + "/" + filenames[i]);
        }
    }
    return newFiles;
}
export async function getFiles(name: string) {
    const directoryPath = path.join(process.cwd(), name);
    return await fs.readdirSync(directoryPath);
}