-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "twitter_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "twitterUsername" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessTokenSecret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "twitter_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reply_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "twitterAccountId" TEXT NOT NULL,
    "targetTweetId" TEXT,
    "targetUsername" TEXT,
    "keywords" TEXT NOT NULL,
    "replyText" TEXT NOT NULL,
    "useAI" BOOLEAN NOT NULL DEFAULT false,
    "aiTone" TEXT,
    "aiIncludeHashtags" BOOLEAN NOT NULL DEFAULT false,
    "aiIncludeEmojis" BOOLEAN NOT NULL DEFAULT false,
    "aiInstructions" TEXT,
    "aiModelId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxReplies" INTEGER NOT NULL DEFAULT 10,
    "currentReplies" INTEGER NOT NULL DEFAULT 0,
    "lastProcessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reply_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reply_jobs_twitterAccountId_fkey" FOREIGN KEY ("twitterAccountId") REFERENCES "twitter_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "replies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replyJobId" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "replyTweetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "replies_replyJobId_fkey" FOREIGN KEY ("replyJobId") REFERENCES "reply_jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_accounts_userId_twitterUsername_key" ON "twitter_accounts"("userId", "twitterUsername");
