import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "~/server/api/trpc";
import { type TestPage } from "~/apiResponseTypes";
import { type TestAttempt } from "@prisma/client";

export const testRouter = createTRPCRouter({

  getTest: publicProcedure
    .input(z.object({
      id: z.string({
          required_error: "Id is required"
      }),
    }))
    .mutation(async ({ ctx, input }):Promise<TestPage> => {
      const id = input.id;
      const test = await ctx.db.test.findUnique({
        where: {
            id: id
        },
        select: {
          id: true,
          name: true,
          instructions: true,
          imageUrl: true,
          maxTimeInMins: true,
          maxLength: true,
          questions: {
            select: {
              correctValues: true,
              title: true,
              id: true
            }
          },
        },
      });
      if(!test) {
        throw new Error("Test not found");
      }
      return test;
    }),

  createTestAttempt: protectedProcedure
    .input(z.object({
      testId: z.string({
          required_error: "Id is required"
      }),
    }))
    .mutation(async ({ ctx, input }):Promise<TestAttempt> => {
      const testId = input.testId;
      if(ctx.session?.user === undefined) {
        throw new Error("User not found");
      }
      const testAttempt = await ctx.db.testAttempt.create({
        data: {
          testId: testId,
          startTime: new Date(),
          userId: ctx.session?.user.id,
          progress: 0,
        },
      });
      return testAttempt;
  }),

  //TO DO CREATE THIS API
  createExplanation: protectedProcedure
    .input(z.object({
      testAttemptId: z.string({
        required_error: "Id is required"
      }),
      questionId: z.string({
        required_error: "Id is required"
      }),
      explanation: z.string({
        required_error: "Id is required"
      }),
    }))
    .mutation(async ({ ctx, input }):Promise<void> => {
      const testAttemptId = input.testAttemptId;
      if(ctx.session?.user === undefined) {
        throw new Error("User not found");
      }   
  })

});
