import AwsClient, { AwsV4Signer } from "../main";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { APIName, type S3AbortMultipartUploadParams, type S3CompleteMultipartUploadParams, type S3CompleteMultipartUploadRequest, type S3CompleteMultipartUploadResponse, type S3CopyObjectParams, type S3CopyObjectResponse, type S3CreateMultipartUploadParams, type S3CreateMultipartUploadResponse, type S3DeleteObjectParams, type S3DeleteObjectsRequest, type S3DeleteObjectsResponse, type S3GetBucketCorsResponse, type S3GetBucketEncryptionResponse, type S3GetBucketLifecycleConfigurationResponse, type S3GetBucketLocationResponse, type S3GetObjectParams, type S3HeadObjectParams, type S3ListBucketsResponse, type S3ListMultipartUploadsParams, type S3ListMultipartUploadsResponse, type S3ListObjectsParams, type S3ListObjectsResponse, type S3ListObjectsV2Params, type S3ListObjectsV2Response, type S3ListPartsParams, type S3ListPartsResponse, type S3PutBucketCorsRequest, type S3PutBucketLifecycleConfigurationRequest, type S3PutObjectParams, type S3UploadPartCopyParams, type S3UploadPartCopyResponse, type S3UploadPartParams } from "./types";

const xmlParser = new XMLParser();
const xmlBuilder = new XMLBuilder();

export default class S3Client extends AwsClient {
    async fetchS3(method: "GET" | "POST" | "HEAD" | "PATCH" | "PUT" | "DELETE", path: string, params?: Record<any, any>, body?: any) {
        if (params) {
            const searchParams = new URLSearchParams(params);
            path += `?${searchParams.toString()}`;
        }
        const res = await super.fetch(path, { method, body, headers: params });
        if (!res.ok) {
            console.error(res)
            throw new Error(`Failed to fetch ${method} ${path}: ${res.status} ${await res.text()}`);
        }
        return res;
    }

    async signS3(method: "GET" | "POST" | "HEAD" | "PATCH" | "PUT" | "DELETE", path: string, apiName: APIName, params: Record<any, any>) {
        params = { ...params, "x-id": apiName }
        const searchParams = new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined)
        );
        path += `?${searchParams.toString()}`;

        const awsSign = new AwsV4Signer({
            ...this,
            signQuery: true,
            method,
            url: `${this.url}${path}`,
            service: "s3",
        })

        const signed = await awsSign.sign()
        return signed.url.toString()
    }

    /**
     * Returns a list of all buckets owned by the authenticated sender of the request.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html
     */
    async ListBuckets(): Promise<S3ListBucketsResponse["ListAllMyBucketsResult"]> {
        const res = await this.fetchS3("GET", "/");
        return xmlParser.parse(await res.text()).ListAllMyBucketsResult;
    }

    /** 
     * You can use this operation to determine if a bucket exists and if you have permission to access it.
     * @throws If the bucket does not exists or if you don't have permission to access it
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html
     */
    async HeadBucket(): Promise<void> {
        return this.fetchS3("HEAD", `/`) as any;
    }

    /**
     * Deletes the S3 bucket.All objects (including all object versions and delete markers) in the bucket must be deleted before the bucket itself can be deleted.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html
     */
    async DeleteBucket(): Promise<void> {
        return this.fetchS3("DELETE", `/`) as any;
    }

    /**
     * Deletes the `cors` configuration information set for the bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketCors.html
     */
    async DeleteBucketCors(): Promise<void> {
        return this.fetchS3("DELETE", `/`, { cors: true }) as any;
    }

    /**
     * Returns the Cross-Origin Resource Sharing (CORS) configuration information set for the bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketCors.html
     */
    async GetBucketCors(): Promise<S3GetBucketCorsResponse["CORSConfiguration"]> {
        const res = await this.fetchS3("GET", `/`, { cors: true });
        return xmlParser.parse(await res.text()).CORSConfiguration;
    }

    /**
     * Returns the lifecycle configuration information set on the bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html
     */
    async GetBucketLifecycleConfiguration(): Promise<S3GetBucketLifecycleConfigurationResponse["LifecycleConfiguration"]> {
        const res = await this.fetchS3("GET", `/`, { lifecycle: true });
        return xmlParser.parse(await res.text()).LifecycleConfiguration;
    }

    /**
     * Returns the Region the bucket resides in.You set the bucket's Region using the `LocationConstraint` request parameter in a `CreateBucket` request.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html
     */
    async GetBucketLocation(): Promise<S3GetBucketLocationResponse["LocationConstraint"]> {
        const res = await this.fetchS3("GET", `/`, { location: true });
        return xmlParser.parse(await res.text()).LocationConstraint;
    }

    /**
     * Returns the default encryption configuration for an Amazon S3 bucket.By default, all buckets have a default encryption configuration that uses server-side encryption with Amazon S3 managed keys (SSE-S3).
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html
     */
    async GetBucketEncryption(): Promise<S3GetBucketEncryptionResponse["ServerSideEncryptionConfiguration"]> {
        const res = await this.fetchS3("GET", `/`, { encryption: true });
        return xmlParser.parse(await res.text()).ServerSideEncryptionConfiguration;
    }

    /**
     * Sets the `cors` configuration for your bucket.If the configuration exists, Amazon S3 replaces it.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketCors.html
     */
    async PutBucketCors(body: S3PutBucketCorsRequest["CORSConfiguration"]): Promise<void> {
        return this.fetchS3("PUT", `/`, { cors: true }, xmlBuilder.build({ CORSConfiguration: body })) as any;
    }

    /**
     * Creates a new lifecycle configuration for the bucket or replaces an existing lifecycle configuration.Keep in mind that this will overwrite an existing lifecycle configuration, so if you want to retain any configuration details, they must be included in the new lifecycle configuration.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLifecycleConfiguration.html
     */
    async PutBucketLifecycleConfiguration(body: S3PutBucketLifecycleConfigurationRequest["LifecycleConfiguration"]): Promise<void> {
        return this.fetchS3("PUT", `/`, { lifecycle: true }, xmlBuilder.build({ LifecycleConfiguration: body })) as any;
    }

    /**
     * The `HEAD` operation retrieves metadata from an object without returning the object itself.This operation is useful if you're interested only in an object's metadata.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html
     */
    async HeadObject(params: S3HeadObjectParams): Promise<void> {
        return this.fetchS3("HEAD", `/`, params) as any;
    }

    /**
     * Returns some or all (up to 1,000) of the objects in a bucket.You can use the request parameters as selection criteria to return a subset of the objects in a bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
     * @deprecated Use `ListObjectsV2` instead
     */
    async ListObjects(params: S3ListObjectsParams): Promise<S3ListObjectsResponse["ListBucketResult"]> {
        const res = await this.fetchS3("GET", `/`, params);
        return xmlParser.parse(await res.text()).ListBucketResult;
    }

    /**
     * Returns some or all (up to 1,000) of the objects in a bucket.You can use the request parameters as selection criteria to return a subset of the objects in a bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
     */
    async ListObjectsV2(params: S3ListObjectsV2Params): Promise<S3ListObjectsV2Response["ListBucketResult"]> {
        const res = await this.fetchS3("GET", `/`, { "list-type": "2", ...params });
        return xmlParser.parse(await res.text()).ListBucketResult;
    }

    /**
     * Retrieves an object from Amazon S3.
     * @returns **{@link Response | `Response`}** - you can use `res.blob()` to get the object as a blob, `res.text()` to get the object as text, or `res.json()` to get the object as JSON.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
     */
    async GetObject(params: S3GetObjectParams): Promise<Response> {
        return this.fetchS3("GET", `/${params.key}`, params);
    }

    /** 
     * Adds an object to a bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
     */
    async PutObject(params: S3PutObjectParams, body: any): Promise<void> {
        return this.fetchS3("PUT", `/${params.key}`, params, body) as any;
    }

    /**
     * Uploads a file to a bucket.
     * 
     * Alias for {@link PutObject}
     * 
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
     */
    UploadFile = this.PutObject;

    /**
     * Removes an object from a bucket.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html
     */
    async DeleteObject(params: S3DeleteObjectParams): Promise<void> {
        return this.fetchS3("DELETE", `/${params.key}`, params) as any;
    }

    /**
     * This operation enables you to delete multiple objects from a bucket using a single HTTP request. If you know the object keys that you want to delete, then this operation provides a suitable alternative to sending individual delete requests, reducing per-request overhead.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html
     */
    async DeleteObjects(body: S3DeleteObjectsRequest["Delete"]): Promise<S3DeleteObjectsResponse> {
        const res = await this.fetchS3("POST", `/`, { delete: true }, xmlBuilder.build({ Delete: body }));
        return xmlParser.parse(await res.text());
    }

    /**
     * This operation lists in-progress multipart uploads in a bucket. An in-progress multipart upload is a multipart upload that has been initiated by the CreateMultipartUpload request, but has not yet been completed or aborted.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListMultipartUploads.html
     */
    async ListMultipartUploads(params: S3ListMultipartUploadsParams): Promise<S3ListMultipartUploadsResponse["ListMultipartUploadsResult"]> {
        const res = await this.fetchS3("GET", `/`, { uploads: true, ...params });
        return xmlParser.parse(await res.text()).ListMultipartUploadsResult;
    }

    /**
     * This action initiates a multipart upload and returns an upload ID. This upload ID is used to associate all of the parts in the specific multipart upload. 
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html
     */
    async CreateMultipartUpload(params: S3CreateMultipartUploadParams): Promise<S3CreateMultipartUploadResponse["InitiateMultipartUploadResult"]> {
        const res = await this.fetchS3("POST", `/${params.key}`, { uploads: true, ...params });
        return xmlParser.parse(await res.text()).InitiateMultipartUploadResult;
    }

    /**
     * Completes a multipart upload by assembling previously uploaded parts.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
     */
    async CompleteMultipartUpload(params: S3CompleteMultipartUploadParams, body: S3CompleteMultipartUploadRequest["CompleteMultipartUpload"]): Promise<S3CompleteMultipartUploadResponse["CompleteMultipartUploadResult"]> {
        const res = await this.fetchS3("POST", `/${params.key}`, params, xmlBuilder.build({ CompleteMultipartUpload: body }));
        return xmlParser.parse(await res.text()).CompleteMultipartUploadResult;
    }

    /**
     * This operation aborts a multipart upload. 
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html
     */
    async AbortMultipartUpload(params: S3AbortMultipartUploadParams): Promise<void> {
        return this.fetchS3("DELETE", `/${params.key}`, params) as any;
    }

    /**
     * Creates a copy of an object that is already stored in Amazon S3.
     * 
     * To specify the data source, you add the request header `x-amz-copy-source` in your request. 
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
     */
    async CopyObject(params: S3CopyObjectParams): Promise<S3CopyObjectResponse["CopyObjectResult"]> {
        const res = await this.fetchS3("PUT", `/${params.key}`, params);
        return xmlParser.parse(await res.text()).CopyObjectResult;
    }

    /**
     * Uploads a part in a multipart upload.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html
     */
    async UploadPart(params: S3UploadPartParams, body: any): Promise<void> {
        return this.fetchS3("PUT", `/${params.key}`, params, body) as any;
    }

    /**
     * Uploads a part by copying data from an existing object as data source. 
     * 
     * To specify the data source, you add the request header `x-amz-copy-source` in your request. 
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPartCopy.html
     */
    async UploadPartCopy(params: S3UploadPartCopyParams): Promise<S3UploadPartCopyResponse["CopyPartResult"]> {
        const res = await this.fetchS3("PUT", `/${params.key}`, params);
        return xmlParser.parse(await res.text()).CopyPartResult;
    }

    /**
     * Lists the parts that have been uploaded for a specific multipart upload.
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html
     */
    async ListParts(params: S3ListPartsParams): Promise<S3ListPartsResponse["ListPartsResult"]> {
        const res = await this.fetchS3("GET", `/${params.key}`, params);
        return xmlParser.parse(await res.text()).ListPartsResult;
    }

    /** Generate a presigned url */
    readonly presign = {
        /**
         * Returns a list of all buckets owned by the authenticated sender of the request.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html
         */
        ListBuckets: (params: {} & PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.ListBuckets, params);
        },

        /** 
         * You can use this operation to determine if a bucket exists and if you have permission to access it.
         * @throws If the bucket does not exists or if you don't have permission to access it
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html
         */
        HeadBucket: (params: PresignedOptions): Promise<string> => {
            return this.signS3("HEAD", "/", APIName.HeadBucket, params);
        },

        /**
         * Deletes the S3 bucket.All objects (including all object versions and delete markers) in the bucket must be deleted before the bucket itself can be deleted.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html
         */
        DeleteBucket: (params: PresignedOptions): Promise<string> => {
            return this.signS3("DELETE", "/", APIName.DeleteBucket, params);
        },

        /**
         * Deletes the `cors` configuration information set for the bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketCors.html
         */
        DeleteBucketCors: (params: PresignedOptions): Promise<string> => {
            return this.signS3("DELETE", "/", APIName.DeleteBucketCors, { cors: true, ...params });
        },

        /**
         * Returns the Cross-Origin Resource Sharing (CORS) configuration information set for the bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketCors.html
         */
        GetBucketCors: (params: PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.GetBucketCors, { cors: true, ...params });
        },

        /**
         * Returns the lifecycle configuration information set on the bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html
         */
        GetBucketLifecycleConfiguration: (params: PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.GetBucketLifecycleConfiguration, { lifecycle: true, ...params });
        },

        /**
         * Returns the Region the bucket resides in.You set the bucket's Region using the `LocationConstraint` request parameter in a `CreateBucket` request.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html
         */
        GetBucketLocation: (params: PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.GetBucketLocation, { location: true, ...params });
        },

        /**
         * Returns the default encryption configuration for an Amazon S3 bucket.By default, all buckets have a default encryption configuration that uses server-side encryption with Amazon S3 managed keys (SSE-S3).
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html
         */
        GetBucketEncryption: (params: PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.GetBucketEncryption, { encryption: true, ...params });
        },

        /**
         * Sets the `cors` configuration for your bucket.If the configuration exists, Amazon S3 replaces it.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketCors.html
         */
        PutBucketCors: (params: PresignedOptions): Promise<string> => {
            return this.signS3("PUT", "/", APIName.PutBucketCors, { cors: true, ...params });
        },

        /**
         * Creates a new lifecycle configuration for the bucket or replaces an existing lifecycle configuration.Keep in mind that this will overwrite an existing lifecycle configuration, so if you want to retain any configuration details, they must be included in the new lifecycle configuration.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLifecycleConfiguration.html
         */
        PutBucketLifecycleConfiguration: (params: PresignedOptions): Promise<string> => {
            return this.signS3("PUT", "/", APIName.PutBucketLifecycleConfiguration, { lifecycle: true, ...params });
        },

        /**
         * The `HEAD` operation retrieves metadata from an object without returning the object itself.This operation is useful if you're interested only in an object's metadata.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html
         */
        HeadObject: (params: S3HeadObjectParams & PresignedOptions): Promise<string> => {
            return this.signS3("HEAD", "/", APIName.HeadObject, params);
        },

        /**
         * Returns some or all (up to 1,000) of the objects in a bucket.You can use the request parameters as selection criteria to return a subset of the objects in a bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
         * @deprecated Use `ListObjectsV2` instead
         */
        ListObjects: (params: S3ListObjectsParams & PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.ListObjects, params);
        },

        /**
         * Returns some or all (up to 1,000) of the objects in a bucket.You can use the request parameters as selection criteria to return a subset of the objects in a bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
         */
        ListObjectsV2: (params: S3ListObjectsV2Params & PresignedOptions): Promise<string> => {
            return this.signS3("GET", "/", APIName.ListObjectsV2, { "list-type": "2", ...params });
        },

        /**
         * Retrieves an object from Amazon S3.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
         */
        GetObject: (params: S3GetObjectParams & PresignedOptions): Promise<string> => {
            return this.signS3("GET", `/${params.key}`, APIName.GetObject, params);
        },

        /** 
         * Adds an object to a bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
         */
        PutObject: (params: S3PutObjectParams & PresignedOptions): Promise<string> => {
            return this.signS3("PUT", `/${params.key}`, APIName.PutObject, params);
        },

        /**
         * Removes an object from a bucket.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html
         */
        DeleteObject: (params: S3DeleteObjectParams & PresignedOptions): Promise<string> => {
            return this.signS3("DELETE", `/${params.key}`, APIName.DeleteObject, params);
        },

        /**
         * This operation enables you to delete multiple objects from a bucket using a single HTTP request. If you know the object keys that you want to delete, then this operation provides a suitable alternative to sending individual delete requests, reducing per-request overhead.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html
         */
        DeleteObjects: (params: PresignedOptions): Promise<string> => {
            return this.signS3("POST", `/`, APIName.DeleteObjects, { delete: true, ...params });
        },

        /**
         * This operation lists in-progress multipart uploads in a bucket. An in-progress multipart upload is a multipart upload that has been initiated by the CreateMultipartUpload request, but has not yet been completed or aborted.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListMultipartUploads.html
         */
        ListMultipartUploads: (params: S3ListMultipartUploadsParams & PresignedOptions): Promise<string> => {
            return this.signS3("GET", `/`, APIName.ListMultipartUploads, { uploads: true, ...params });
        },

        /**
         * This action initiates a multipart upload and returns an upload ID. This upload ID is used to associate all of the parts in the specific multipart upload. 
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html
         */
        CreateMultipartUpload: (params: S3CreateMultipartUploadParams & PresignedOptions): Promise<string> => {
            return this.signS3("POST", `/${params.key}`, APIName.CreateMultipartUpload, { uploads: true, ...params });
        },

        /**
         * Completes a multipart upload by assembling previously uploaded parts.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
         */
        CompleteMultipartUpload: (params: S3CompleteMultipartUploadParams & PresignedOptions): Promise<string> => {
            return this.signS3("POST", `/${params.key}`, APIName.CompleteMultipartUpload, params);
        },

        /**
         * This operation aborts a multipart upload. 
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html
         */
        AbortMultipartUpload: (params: S3AbortMultipartUploadParams & PresignedOptions): Promise<string> => {
            return this.signS3("DELETE", `/${params.key}`, APIName.AbortMultipartUpload, params);
        },

        /**
         * Creates a copy of an object that is already stored in Amazon S3.
         * 
         * To specify the data source, you add the request header `x-amz-copy-source` in your request. 
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
         */
        CopyObject: (params: S3CopyObjectParams & PresignedOptions): Promise<string> => {
            return this.signS3("PUT", `/${params.key}`, APIName.CopyObject, params);
        },

        /**
         * Uploads a part in a multipart upload.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html
         */
        UploadPart: (params: S3UploadPartParams & PresignedOptions): Promise<string> => {
            return this.signS3("PUT", `/${params.key}`, APIName.UploadPart, params);
        },

        /**
         * Uploads a part by copying data from an existing object as data source. 
         * 
         * To specify the data source, you add the request header `x-amz-copy-source` in your request. 
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPartCopy.html
         */
        UploadPartCopy: (params: S3UploadPartCopyParams & PresignedOptions): Promise<string> => {
            return this.signS3("PUT", `/${params.key}`, APIName.UploadPartCopy, params);
        },

        /**
         * Lists the parts that have been uploaded for a specific multipart upload.
         * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html
         */
        ListParts: (params: S3ListPartsParams & PresignedOptions): Promise<string> => {
            return this.signS3("GET", `/${params.key}`, APIName.ListParts, params);
        },
    }
}

export { S3Client };

interface PresignedOptions {
    "X-Amz-Expires"?: number;
}
