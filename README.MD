Vivid Image Art Website
All Rights Reserved - Justin Carlson - 2015

You will need to create a file called "config.js" in the "config" folder.  You will need to fill in the appropriate values:

        var options = {
            JWT_SECRET_KEY :                "YOUR_JWT_SECRET_KEY",
            MY_NODE_ENV :                   "development",
            S3_REGION_NAME :                "YOUR_AWS_REGION",
            S3_BUCKET_NAME :                "YOUR_AWS_BUCKET_NAME",
            S3_ACCESS_KEY_ID :              "YOUR_AWS_ACCESS_KEY_ID",
            S3_SECRET_ACCESS_KEY :          "YOUR_AWS_SECRET_ACCESS_KEY",
            S3_ACL_POLICY :                 "public-read",
            S3_USE_SSL :                    true,
            GA_ACCOUNT_ID :                 "YOUR_GA_ACCOUNT_ID",
            BASE_URL:                       "THE_BASE_URL_FOR_YOUR_SITE",
            CERT_KEY_PATH:                  "/path/to/the/privkey.pem",
            CERT_PATH:                      "/path/to/the/fullchain.pem",
            VALID_USERS: [
                {
                    id: 1,
                    userName: "abc",
                    hash: "xyz",
                    salt: "123"
                },
                {
                    id: 2,
                    userName: "def",
                    hash: "xyz",
                    salt: "123"
                }
            ]
        };
        
        module.exports = options;

Please note that this file is NOT included with this repo, and you will have to add it on your own.  Additionally, you need to copy your certs somewhere that the NodeJS instance is able to access.