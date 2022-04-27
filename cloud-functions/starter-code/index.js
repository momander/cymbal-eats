// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const imageMagick = require('imagemagick');
const Promise = require("bluebird");
const path = require('path');
//6 TODO: Add the vision API module
//1 TODO: Add the storage modules
const axios = require('axios');
var fs = require('fs');


exports.process_thumbnails = async (file, context) => 
{
    try {

        console.log(`Received thumbnail request for file ${file.name} from bucket ${file.bucket}`);

        //2 TODO: Create a Storage object
        //3 TODO: Create a reference to the Cloud Storage buckets

        //7 TODO: Construct an instance of Image Annotator Client
        //8 TODO: Build a vision request
        
        // We launch the vision call first so we can process the thumbnail while we wait for the response.
        //9 TODO: Annotate a single image with the requested features

        if (!fs.existsSync("/tmp/original")){
            fs.mkdirSync("/tmp/original");
        }
        if (!fs.existsSync("/tmp/thumbnail")){
            fs.mkdirSync("/tmp/thumbnail");
        }

        const originalFile = `/tmp/original/${file.name}`;
        const thumbFile = `/tmp/thumbnail/${file.name}`

        //4 TODO: Download a file into memory or to a local destination

        //5 TODO: Get public URL of this file 
        console.log(`Downloaded picture into ${originalFile}`);

        const itemID = parseInt(path.parse(file.name).name);

        if (isNaN(itemID)){
            return;
        }

        const resizeCrop = Promise.promisify(imageMagick.crop);
        await resizeCrop({
                srcPath: originalFile,
                dstPath: thumbFile,
                width: 400,
                height: 400
        });
        console.log(`Created local thumbnail in ${thumbFile}`);

        //6 TODO: Upload a file to the bucket and get the public URL of the file
        console.log(`Uploaded thumbnail to Cloud Storage bucket ${process.env.BUCKET_THUMBNAILS}`);
        const visionResponse = await visionPromise;
        console.log(`Raw vision output for: ${file.name}: ${JSON.stringify(visionResponse[0])}`);
        let status = "Failed"
        //10 TODO: Loop through label annotations and set status to Ready if the image has a "Food" label

        const menuServer = axios.create({
            baseURL: process.env.MENU_SERVICE_URL,
            headers :{ 
                get: {
                    "Content-Type": 'application/json'
                }
            }
        })
        const item = await menuServer.get(`/menu/${itemID}`);
        // Send update call to menu service
        const request = await menuServer.put(`/menu/${itemID}`, {
                itemImageURL: originalImageUrl,
                itemName: item.data.itemName,
                itemPrice: item.data.itemPrice,
                itemThumbnailURL: thumbnailImageUrl,
                spiaceLevel: item.data.spiaceLevel,
                status: status,
                tagLine: item.data.tagLine

        })

    } catch (err) {
        console.log(`Error: creating the thumbnail: ${err}`);
        console.error(err);
    }
};