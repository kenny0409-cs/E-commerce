// Import the cloudinary library
import cloudinary from "cloudinary";

// Import the dotenv library
import dotenv from "dotenv";

// Load environment variables from a file named 'config.env' in the 'backend/config' directory
dotenv.config({path: 'backend/config/config.env'});

// Configure cloudinary with environment variables
cloudinary.config({
    // Set the cloud name to the value of the CLOUDINARY_CLOUD_NAME environment variable
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    // Set the API key to the value of the CLOUDINARY_API_KEY environment variable
    api_key : process.env.CLOUDINARY_API_KEY,
    // Set the API secret to the value of the CLOUDINARY_API_SECRET environment variable
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export a function to upload a file to cloudinary
export const upload_file = (file, folder) => {
    // Return a new promise
    return new Promise((resolve, reject) => {
        // Upload the file to cloudinary
        cloudinary.uploader.upload(
            // The file to upload
            file,
            // A callback function to handle the result
            (result) => {
                // Resolve the promise with an object containing the public ID and URL of the uploaded file
                resolve({
                    public_id: result.public_id,
                    url: result.url,
                });
            },
            // Options for the upload
            {
                // Automatically detect the file type
                resource_type: "auto",
                // The folder to upload the file to
                folder,
            }
        );
    });
};

// Export an async function to delete a file from cloudinary
export const delete_file =  async (file) => {
    // Destroy the file on cloudinary
    const res = await cloudinary.uploader.destroy(file);

    // If the result is "ok", return true
    if(res?.result === "ok") return true;
};