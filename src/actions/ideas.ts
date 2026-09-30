"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function postTeamIdea(content: string, authorId: string) {
  try {
    await prisma.teamIdea.create({
      data: {
        content,
        authorId
      }
    });
    revalidatePath("/admin/pilot/ideas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTeamIdea(ideaId: string, authorId: string) {
  try {
    await prisma.teamIdea.delete({
      where: { id: ideaId, authorId }
    });
    revalidatePath("/admin/pilot/ideas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTeamIdea(ideaId: string, authorId: string, content: string) {
  try {
    await prisma.teamIdea.update({
      where: { id: ideaId, authorId },
      data: { content }
    });
    revalidatePath("/admin/pilot/ideas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function postIdeaComment(ideaId: string, authorId: string, content: string) {
  try {
    await prisma.teamIdeaComment.create({
      data: {
        ideaId,
        authorId,
        content
      }
    });
    revalidatePath("/admin/pilot/ideas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteIdeaComment(commentId: string, authorId: string) {
  try {
    await prisma.teamIdeaComment.delete({
      where: { id: commentId, authorId }
    });
    revalidatePath("/admin/pilot/ideas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
