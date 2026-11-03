import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/utils/api";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/validators/schemas";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const workspaceId = formData.get("workspaceId") as string | null;

  if (!file) return apiError("No file provided");
  if (!workspaceId) return apiError("workspaceId is required");

  // Verify workspace membership
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return apiError(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
  }

  // Validate MIME type
  const mimeType = file.type as (typeof ALLOWED_MIME_TYPES)[number];
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return apiError("File type not allowed");
  }

  // Validate file extension matches MIME type
  const ext = extname(file.name).toLowerCase();
  const allowedExtensions: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/webm": [".webm"],
  };
  if (!allowedExtensions[mimeType]?.includes(ext)) {
    return apiError("File extension does not match type");
  }

  // Generate safe filename
  const safeFilename = `${uuidv4()}${ext}`;
  const uploadPath = join(process.cwd(), "public", "uploads", workspaceId);
  const filePath = join(uploadPath, safeFilename);

  // Ensure upload directory exists
  await mkdir(uploadPath, { recursive: true });

  // Write file
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Store metadata in database
  const publicUrl = `/uploads/${workspaceId}/${safeFilename}`;

  const asset = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedBy: session.user.id,
      filename: safeFilename,
      originalName: file.name.slice(0, 255), // truncate for safety
      url: publicUrl,
      mimeType,
      size: file.size,
    },
  });

  return apiSuccess(asset, 201);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiUnauthorized();

  const { searchParams } = req.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  if (!workspaceId) return apiError("workspaceId is required");

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!member) return apiForbidden();

  const where = {
    workspaceId,
    ...(search
      ? { originalName: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return apiSuccess({ assets, total, page, limit, pages: Math.ceil(total / limit) });
}
