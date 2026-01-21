// app/middleware/expiredUrlsChecker.ts
import dbConnect from "@/libs/db";
import { Url } from "@/app/models/Url";

export async function checkAndSuspendExpiredUrls() {
  await dbConnect();
  
  const now = new Date();
  
  try {
    // Find all URLs that have expired but are not suspended
    const expiredUrls = await Url.find({
      expireAt: { $lt: now },
      isSuspended: false
    });
    
    if (expiredUrls.length > 0) {
      
      // Suspend all expired URLs
      await Url.updateMany(
        { _id: { $in: expiredUrls.map(url => url._id) } },
        { isSuspended: true }
      );
      
    }
  } catch (error) {
    console.error("Error suspending expired URLs:", error);
  }
}