import { Controller, Get } from "@nestjs/common";
import { post } from "./types/post.type";


@Controller('/post')
export class PostController
{
    @Get()
    protected getPost (){
        
        return
    }
}