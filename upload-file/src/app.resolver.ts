import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

const storage = new Storage({
  projectId: 'yash-dev-349706',
  keyFilename: path.join(__dirname, '../src/yash-dev-349706-e210d8cb7b3b.json'),
});

// Access Control - Uniform (Private)
const bucket = storage.bucket('yash-boldcare-testing');

// Access Control - Uniform (Public)
const bucket1 = storage.bucket('yash-boldcare-testing-public');

// Access Control - Fine Grained
const bucket2 = storage.bucket('yash-boldcare-testing-fine');
@Resolver()
export class AppResolver {
  @Query(() => String)
  sayHello(): string {
    async function listBuckets() {
      try {
        const results = await storage.getBuckets();

        const [buckets] = results;

        buckets.forEach((bucket) => {
          console.log(bucket.name);
        });
      } catch (err) {
        console.error('ERROR:', err);
      }
    }
    listBuckets();

    return 'Hello World!';
  }

  @Mutation(() => String)
  async singleUpload(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ) {
    await new Promise((resolves, rejects) =>
      file
        .createReadStream()
        .pipe(
          bucket2.file(`check/${file.filename}`).createWriteStream({
            resumable: false,
            gzip: true,
          }),
        )
        .on('error', (err: any) => rejects(err))
        .on('finish', resolves),
    );

    // For bucket and bucket1 we can't use below line code
    await bucket2.file(`check/${file.filename}`).makePublic();

    return `https://storage.cloud.google.com/yash-boldcare-testing-fine/check/${file.filename}`;
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Args({ name: 'file', type: () => [GraphQLUpload] })
    files: FileUpload[],
  ): Promise<boolean | string[]> {
    const newFiles = await Promise.all(files);

    await Promise.all(
      newFiles.map((file) => {
        return new Promise((resolves, rejects) =>
          file
            .createReadStream()
            .pipe(
              bucket.file(file.filename).createWriteStream({
                resumable: false,
                gzip: true,
              }),
            )
            .on('error', (err: any) => rejects(err))
            .on('finish', resolves),
        );
      }),
    );

    return true;
  }

  @Mutation(() => String)
  async getSignedUrl(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ) {
    await new Promise((resolves, rejects) =>
      file
        .createReadStream()
        .pipe(
          bucket.file(file.filename).createWriteStream({
            resumable: false,
            gzip: true,
          }),
        )
        .on('error', (err: any) => rejects(err))
        .on('finish', resolves),
    );

    const [url] = await bucket
      .file(encodeURIComponent(file.filename))
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1 * 60 * 1000,
      });

    return url;
  }

  @Query(() => String)
  async getDownloadUrl(
    @Args({ name: 'file', type: () => String }) file: string,
  ) {
    await bucket1.file(file).download({ destination: file });

    return 'success';
  }
}
