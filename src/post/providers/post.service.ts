import { Injectable } from "@nestjs/common";
import { post } from "../types/post.type";
import { user } from "src/user/types/user.type";

interface GetPostsOptions {
    userId?: user["id"];
    postId?: post["postId"];
    title?: post['title'];
    limit: number;
    pageOffset: number;
}

@Injectable()
export class PostService
{

    public getPosts = async (options: GetPostsOptions): Promise<Array<post>> => {
        // Implement your service logic here
        return new Array({
                userId: 100,
                postId: 1234,
                title: 'abcd',
                content: 'asd123 123'
            })
            

        ;
    }
    public getAllPosts = (userId: number): Array<post> => {
        
        return
    }

    public getPost = (postId: number): post[] =>
    {
        return
    }
}