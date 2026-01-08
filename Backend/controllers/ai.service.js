import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction:`
    You are an code reviewer for programming language and also mention the language from the given syntax who have expertise in development 
    If any correction then send the correct version of provided code and 
    suggestions for improvment so don't provide bulk of lines only corrected syntax is required
    so just provide code set for improvement,the errors and the suggested code to write no need to provide any description and don't provide name of language there please notice it
    also tell what percentage of the code is correct.   
    `
 });

const getresponse= async(code)=>{
    const result=await model.generateContent(code);
    return result.response.text();
}
export default getresponse;