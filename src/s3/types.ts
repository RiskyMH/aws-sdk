/** Because this is typed XML, it is only a list if 2+ of the same keys exist */
type Listable<T> = T | T[]
/** Because this is typed XML, the date should be ISO string and you should parse it yourself */
type DateString = string

export const enum APIName {
    ListBuckets = "ListBuckets",
    HeadBucket = "HeadBucket",
    CreateBucket = "CreateBucket",
    DeleteBucket = "DeleteBucket",
    DeleteBucketCors = "DeleteBucketCors",
    GetBucketCors = "GetBucketCors",
    GetBucketLifecycleConfiguration = "GetBucketLifecycleConfiguration",
    GetBucketLocation = "GetBucketLocation",
    GetBucketEncryption = "GetBucketEncryption",
    PutBucketCors = "PutBucketCors",
    PutBucketLifecycleConfiguration = "PutBucketLifecycleConfiguration",

    HeadObject = "HeadObject",
    ListObjects = "ListObjects",
    ListObjectsV2 = "ListObjectsV2",
    GetObject = "GetObject",
    PutObject = "PutObject",
    DeleteObject = "DeleteObject",
    DeleteObjects = "DeleteObjects",
    ListMultipartUploads = "ListMultipartUploads",
    CreateMultipartUpload = "CreateMultipartUpload",
    CompleteMultipartUpload = "CompleteMultipartUpload",
    AbortMultipartUpload = "AbortMultipartUpload",
    CopyObject = "CopyObject",
    UploadPart = "UploadPart",
    UploadPartCopy = "UploadPartCopy",
    ListParts = "ListParts",
}


/***************************/
// Common Types            //
/***************************/

export type S3ChecksumAlgorithm = "CRC32" | "CRC32C" | "SHA1" | "SHA256"

export interface S3Object {
    ChecksumAlgorithm?: Listable<S3ChecksumAlgorithm>,
    ETag?: string,
    Key?: string,
    LastModified?: DateString,
    Owner?: S3Owner,
    RestoreStatus?: S3RestoreStatus,
    Size?: number,
    StorageClass?: string,
}

export interface S3Bucket {
    CreationDate?: DateString,
    Name?: string,
}

export interface S3Owner {
    DisplayName?: string,
    ID?: string,
}

export interface S3BucketInfo {
    DataRedundancy: string,
    Type: string,
}

export interface S3LocationInfo {
    Name?: string,
    Type?: string,
}

export interface S3RestoreStatus {
    IsRestoreInProgress: boolean,
    RestoreExpiryDate: string,
}

export interface S3CORSRule {
    AllowedMethod: Listable<string>,
    AllowedOrigin: Listable<string>,
    AllowedHeader?: Listable<string>,
    ExposeHeader?: Listable<string>,
    ID?: string,
    MaxAgeSeconds?: number,
}

export interface S3LifecycleRule {
    AbortIncompleteMultipartUpload: {
        DaysAfterInitiation: number
    },
    Expiration: {
        Days: number,
    },
    Filter: Listable<S3LifecycleRuleFilter>,
    Status: "Enabled" | "Disabled",
}

export interface S3LifecycleRuleFilter {
    And?: {
        ObjectSizeGreaterThan: number,
        ObjectSizeLessThan: number,
        Prefix: string,
        Tag: Listable<{
            Key: string,
            Value: string,
        }>,
    },
    ObjectSizeGreaterThan?: number,
    ObjectSizeLessThan?: number,
    Tag: Listable<{
        Key: string,
        Value: string,
    }>,
    ID: string,
    NoncurrentVersionExpiration: Listable<{
        NewerNoncurrentVersions: number,
        NoncurrentDays: number,
        StorageClass?: string,
    }>,
    Prefix?: string,
    Transition: Listable<{
        Days: number,
        StorageClass: string,
    }>,
}


/***************************/
// Bucket-level operations //
/***************************/

// ListBuckets: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html
export interface S3ListBucketsResponse {
    ListAllMyBucketsResult: {
        Buckets?: {
            Bucket: Listable<S3Bucket>,
        },

        Owner?: S3Owner,
    }
}


// HeadBucket: https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html
// - This is a simple operation that doesn't require any parameters

// CreateBucket: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html
export interface S3CreateBucketRequest {
    CreateBucketConfiguration: {
        LocationConstraint?: string,
        Location?: S3LocationInfo,
        Bucket?: S3BucketInfo
    }
}


// DeleteBucket: https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html
// - This is a simple operation that doesn't require any parameters


// DeleteBucketCors: https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucketCors.html
// - This is a simple operation that doesn't require any parameters


// GetBucketCors: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketCors.html
export interface S3GetBucketCorsResponse {
    CORSConfiguration: {
        CORSRule?: Listable<S3CORSRule>,
    }
}

// GetBucketLifecycleConfiguration: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycleConfiguration.html
export interface S3GetBucketLifecycleConfigurationResponse {
    LifecycleConfiguration: {
        Rule?: Listable<S3LifecycleRule>,
    }
}


// GetBucketLocation: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html
export interface S3GetBucketLocationResponse {
    LocationConstraint: {
        LocationConstraint?: string,
    }
}


// GetBucketEncryption: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html
export interface S3GetBucketEncryptionResponse {
    ServerSideEncryptionConfiguration: {
        Rule?: Listable<{
            ApplyServerSideEncryptionByDefault?: {
                KMSMasterKeyID: string,
                SSEAlgorithm?: string,
            },
            BucketKeyEnabled?: boolean,
        }>,
    }
}


// PutBucketCors: https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketCors.html
export interface S3PutBucketCorsRequest {
    CORSConfiguration: {
        CORSRule: Listable<S3CORSRule>,
    }
}


// PutBucketLifecycleConfiguration: https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketLifecycleConfiguration.html
// export interface S3PutBucketLifecycleConfigurationRequest extends S3GetBucketLifecycleConfigurationResponse { }
export interface S3PutBucketLifecycleConfigurationRequest {
    LifecycleConfiguration: {
        Rule: Listable<S3LifecycleRule>,
    }
}


/***************************/
// ​​Object-level operations //
/***************************/

// HeadObject: https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html
export interface S3HeadObjectParams {
    key: string,
    "If-Match"?: boolean,
    "If-Modified-Since"?: string,
    "If-None-Match"?: boolean,
    "If-Unmodified-Since"?: string,
    Range?: string,
    partNumber: number,
}


// ListObjects: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
/** @deprecated Action revised to {@link S3ListObjectsParamsV2} */
export interface S3ListObjectsParams {
    delimiter?: string,
    "encoding-type"?: string,
    marker?: string,
    "max-keys"?: number,
    prefix?: string,
}

/** @deprecated Action revised to {@link S3ListObjectsResponseV2} */
export interface S3ListObjectsResponse {
    ListBucketResult: {
        IsTruncated?: boolean,
        Marker?: boolean,
        NextMarker?: boolean,
        Contents?: Listable<S3Object>,
        Name?: string,
        Prefix?: string,
        Delimiter?: string,
        MaxKeys?: number,
        CommonPrefixes?: Listable<{
            Prefix?: string,
        }>,
        EncodingType?: string,
    }
}


// ListObjectsV2: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
export interface S3ListObjectsV2Params {
    "continuation-token"?: string,
    delimiter?: string,
    "encoding-type"?: string,
    "fetch-owner"?: boolean,
    "max-keys"?: number,
    prefix?: string,
    "start-after"?: string,
}

export interface S3ListObjectsV2Response {
    ListBucketResult: {
        IsTruncated?: boolean,
        Contents?: Listable<S3Object>,
        Name?: string,
        Prefix?: string,
        Delimiter?: string,
        MaxKeys?: number,
        CommonPrefixes?: Listable<{
            Prefix: string,
        }>,
        EncodingType?: string,
        KeyCount?: number,
        ContinuationToken?: string,
        NextContinuationToken?: string,
        StartAfter?: string,
    }
}


// GetObject: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
export interface S3GetObjectParams {
    key: string,
    "If-Match"?: boolean,
    "If-Modified-Since"?: string,
    "If-None-Match"?: boolean,
    "If-Unmodified-Since"?: string,
    "response-content-type"?: string,
    Range?: string,
    partNumber?: number,
}

// this should be whatever you uploaded
export type S3GetObjectResponse = any


// PutObject: https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
export interface S3PutObjectParams {
    key: string,
    "Content-Type"?: string,
    "Cache-Control"?: string,
    "Content-Disposition"?: string,
    "Content-Encoding"?: string,
    "Content-Language"?: string,
    Expires?: string,
    "Content-MD5"?: string,
}

// this should be whatever you want to upload
export type S3PutObjectRequest = any


// DeleteObject: https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html
export interface S3DeleteObjectParams {
    key: string,
}


// DeleteObjects: https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html
export interface S3DeleteObjectsRequest {
    Delete: {
        Object: Listable<{
            Key: string,
            VersionId?: string,
        }>,
        Quiet?: true,
    }
}

export interface S3DeleteObjectsResponse {
    DeleteResult: {
        Deleted?: Listable<{
            DeleteMarker?: boolean,
            DeleteMarkerVersionId?: string,
            Key?: string,
            VersionId?: string,
        }>,
        Errors: Listable<{
            Code?: string,
            Key?: string,
            Message?: string,
            VersionId?: string,
        }>,
    }
}


// ListMultipartUploads: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListMultipartUploads.html
export interface S3ListMultipartUploadsParams {
    "delimiter"?: string,
    "encoding-type"?: string,
    "key-marker"?: string,
    "max-uploads"?: number,
    "prefix"?: string,
    "upload-id-marker"?: string,
}

export interface S3ListMultipartUploadsResponse {
    ListMultipartUploadsResult: {
        KeyMarker?: string,
        UploadIdMarker?: string,
        NextKeyMarker?: string,
        Prefix?: string,
        Delimiter?: string,
        NextUploadIdMarker?: string,
        MaxUploads?: number,
        IsTruncated?: boolean,
        Upload?: Listable<{
            ChecksumAlgorithm?: S3ChecksumAlgorithm,
            Initiated?: DateString,
            Initiator?: S3Owner,
            Key?: string,
            Owner?: S3Owner,
            StorageClass?: string,
            UploadId?: string,
        }>,
        CommonPrefixes?: Listable<{
            Prefix?: string,
        }>,
        EncodingType?: string,
    }
}


//  CreateMultipartUpload: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html
export interface S3CreateMultipartUploadParams {
    key: string,
    "Content-Type"?: string,
    "Cache-Control"?: string,
    "Content-Disposition"?: string,
    "Content-Encoding"?: string,
    "Content-Language"?: string,
    Expires?: string,
    "Content-MD5"?: string,
}

export interface S3CreateMultipartUploadResponse {
    InitiateMultipartUploadResult: {
        Bucket?: string,
        Key: string,
        UploadId: string,
    }
}


// CompleteMultipartUpload: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
export interface S3CompleteMultipartUploadParams {
    key: string,
    uploadId: string,
}

export interface S3CompleteMultipartUploadRequest {
    CompleteMultipartUpload: {
        Part: Listable<{
            ChecksumCRC32?: string,
            ChecksumCRC32C?: string,
            ChecksumSHA1?: string,
            ChecksumSHA256?: string,
            ETag?: string,
            PartNumber?: number,
        }>,
    }
}

export interface S3CompleteMultipartUploadResponse {
    CompleteMultipartUploadResult: {
        Location?: string,
        Key?: string,
        ETag?: string,
        ChecksumCRC32?: string,
        ChecksumCRC32C?: string,
        ChecksumSHA1?: string,
        ChecksumSHA256?: string,
    }
}


// AbortMultipartUpload: https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html
export interface S3AbortMultipartUploadParams {
    key: string,
    uploadId: string,
}


// CopyObject: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
export interface S3CopyObjectParams {
    key: string,
    "x-amz-metadata-directive"?: string,
    "Content-Type"?: string,
    "Cache-Control"?: string,
    "Content-Disposition"?: string,
    "Content-Encoding"?: string,
    "Content-Language"?: string,
    Expires?: string,
    "x-amz-copy-source": string,
    "x-amz-copy-source-if-match"?: string,
    "x-amz-copy-source-if-modified-since"?: string,
    "x-amz-copy-source-if-none-match"?: string,
    "x-amz-copy-source-if-unmodified-since"?: string,
}

export interface S3CopyObjectResponse {
    CopyObjectResult: {
        ETag?: string,
        LastModified: string,
        ChecksumCRC32?: string,
        ChecksumCRC32C?: string,
        ChecksumSHA1?: string,
        ChecksumSHA256?: string,
    }
}


// UploadPart: https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html
export interface S3UploadPartParams {
    key: string,
    uploadId: string,
    partNumber: number,
    "Content-MD5"?: string,
}

// this should be whatever you want to upload
export type S3UploadPartRequest = any

// UploadPartCopy: https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPartCopy.html
export interface S3UploadPartCopyParams {
    key: string,
    uploadId: string,
    partNumber: number,
    "x-amz-copy-source-range"?: string,
    "x-amz-copy-source": string
}

export interface S3UploadPartCopyResponse {
    CopyPartResult: {
        ETag: string,
        LastModified: string,
        ChecksumCRC32?: string,
        ChecksumCRC32C?: string,
        ChecksumSHA1?: string,
        ChecksumSHA256?: string,
    }
}


// ListParts: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html
export interface S3ListPartsParams {
    key: string,
    uploadId: string,
    "max-parts"?: number,
    "part-number-marker"?: number,
}

export interface S3ListPartsResponse {
    ListPartsResult: {
        Key: string,
        UploadId: string,
        PartNumberMarker?: number,
        NextPartNumberMarker?: number,
        MaxParts?: number,
        IsTruncated?: boolean,
        Part?: Listable<{
            ChecksumCRC32?: string,
            ChecksumCRC32C?: string,
            ChecksumSHA1?: string,
            ChecksumSHA256?: string,
            ETag: string,
            LastModified: string,
            PartNumber: number,
            Size: number,
        }>,
        Initiator: S3Owner,
        Owner: S3Owner,
        StorageClass: string,
        ChecksumAlgorithm: S3ChecksumAlgorithm,
    }
}
