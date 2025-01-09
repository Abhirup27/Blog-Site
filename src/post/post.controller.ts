import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, ValidationPipe } from "@nestjs/common";
import { post } from "./types/post.type";
import { PostService } from "./providers/post.service";
import { GetPostParamsDto } from "./DTOs/get-post.dto";


@Controller('/posts')
export class PostController
{
    constructor(
        private readonly postsService: PostService
    )
    {

    }
    @Get('/:userId?/:postId?')
    protected getPosts(@Param(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) 
    getPostsparams: GetPostParamsDto,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageOffset: number
    ): Promise<Array<post>> {
        
        const { userId, postId } = getPostsparams;
        return this.postsService.getPosts({
            userId,
            postId,
            limit,
            pageOffset
        })
        
    }
}