     import mongoose from "mongoose";
     import { Upload } from "./src/models/upload.model.js";

     await mongoose.connect("mongodb+srv://edigaravinaykumar:tuLOr2wQeFEuS82P@cluster0.sg9ss.mongodb.net/vruksha?appName=Cluster0");
     await Upload.updateMany(
       { user: "692a96b0f7f407f1220244b7" },
       { $set: { Points: 150 } }
     );
     console.log("Points updated");