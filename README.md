# `@riskymh/aws`
This package provides a set of utilities for working with AWS services.
It extends [`aws4fetch`](https://npmjs.com/package/aws4fetch) to add types and methods. As such it works well in serverless environments and is a good alternative to the bloated [`@aws-sdk/client-s3`](https://www.npmjs.com/package/@aws-sdk/client-s3).

If the types are wrong or you have a feature request, please open an issue on [the repo](https://github.com/RiskyMH/aws-sdk).

**NOTE:** This is v0 still and can contain breaking changes.

## S3 API (`@riskymh/aws/s3`)
All the actions that the [AWS S3 API Docs](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Operations_Amazon_Simple_Storage_Service.html) include should be available in this package. This has only been tested with R2, if you find any issues please open an issue.

This package also works with Cloudflare R2

### S3 Example:
```ts
import { S3Client } from '@riskymh/aws/s3'

const s3 = new S3Client({
    accessKeyId: "",
    secretAccessKey: "",
    region: "auto",
    url: "https://xxxxxxxxxxxxxxxx.r2.cloudflarestorage.com/bucketName"
})

const response = await s3.ListObjectsV2()
console.log(response) // { Contents: [{ Key: "yes.txt", Size: 1, LastModified: "2024-01-01T01:00:00.00.000Z" }], IsTruncated: false }
// ^ this was automatically parsed from the XML response

const objectUrl = s3.presign.GetObject({ Key: "yes.txt" })
console.log(objectUrl) // "https://xxxxxxxxxxxxxxxx.r2.cloudflarestorage.com/bucketName/yes.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=...&X-Amz-SignedHeaders=host&X-Amz-Signature=..."
```

## Contributing
The types and routes are manually added, so you can update that directly and open a PR.
