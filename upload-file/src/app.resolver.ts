import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';

@Resolver()
export class AppResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => Boolean)
  async singleUpload(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) =>
      file
        .createReadStream()
        .pipe(createWriteStream(`./uploads/${file.filename}`))
        .on('finish', () => resolve(true))
        .on('error', () => reject(false)),
    );
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Args({ name: 'file', type: () => [GraphQLUpload] })
    files: FileUpload[],
  ): Promise<boolean | string[]> {
    const newFiles = await Promise.all(files);

    const x = await Promise.all(
      newFiles.map((file) => {
        return new Promise<boolean>(async (resolve, reject) =>
          file
            .createReadStream()
            .pipe(createWriteStream(`./uploads/${file.filename}`))
            .on('finish', () => resolve(true))
            .on('error', () => reject(false)),
        );
      }),
    );

    console.log(newFiles);

    console.log(x);

    return true;
  }
}

// { createReadStream, filename }: FileUpload,
