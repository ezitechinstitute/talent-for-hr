import getMulterStorage from "../../utils/multerStorage.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import cmsController from "../../controller/admin-controller/cms.controller.js";
import express from 'express'
import checkPermission from "../../middlewares/permission.middleware.js";
const router = express.Router();

const {
    // CMS Controller
      getHomeBanners,
      deleteHomeBanner,
      updateHomeBanner,
      createHomeBanner,
      getAboutPage,
      updateAboutPage,
      createAboutPage,
      getAllBlogPosts,
      getBlogPostById,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      getAllFAQs,
      createFAQ,
      updateFAQ,
      deleteFAQ,
      getPrivacyPolicy,
      createPrivacyPolicy,
      updatePrivacyPolicy,
      getTermsAndConditions,
      createTerms,
      updateTermsAndConditions,
} = cmsController
const homeBannerUpload = getMulterStorage("home-banners");
// ------------------ HOME BANNER ------------------
router.get("/home-banners", checkPermission("cms", "read"), asyncHandler(getHomeBanners));
router.post(
  "/create-banner",
  checkPermission("cms", "create"),
  homeBannerUpload.single("image"),
  asyncHandler(createHomeBanner)
);
router.put(
  "/update-banner/:id",
  checkPermission("cms", "update"),
  homeBannerUpload.single("image"),
  asyncHandler(updateHomeBanner)
);
router.delete("/delete-banner/:id",checkPermission("cms", "delete"), asyncHandler(deleteHomeBanner));
// ------------------ ABOUT PAGE ------------------
router.post("/create-about",checkPermission("cms", "create"), asyncHandler(createAboutPage));
router.get("/about",checkPermission("cms", "read"), asyncHandler(getAboutPage));
router.put("/update-about",checkPermission("cms", "update"), asyncHandler(updateAboutPage));
// ----------------------Faq-------------------
router.get("/all-faqs",checkPermission("cms", "read"), asyncHandler(getAllFAQs));
router.post("/create-faq",checkPermission("cms", "create"), asyncHandler(createFAQ));
router.put("/faq/:id",checkPermission("cms", "update"), asyncHandler(updateFAQ));
router.delete("/delete-faq/:id",checkPermission("cms", "delete"), asyncHandler(deleteFAQ));
// ------------------ PRIVACY POLICY ------------------
router.get("/privacy-policy",checkPermission("cms", "read"), asyncHandler(getPrivacyPolicy));
router.post("/privacy-policy/create",checkPermission("cms", "create"), asyncHandler(createPrivacyPolicy));
router.put("/privacy-policy/update",checkPermission("cms", "update"), asyncHandler(updatePrivacyPolicy));
// ------------------ TERMS & CONDITIONS ------------------
router.get("/terms",checkPermission("cms", "read"), asyncHandler(getTermsAndConditions));
router.post("/terms/create",checkPermission("cms", "create"), asyncHandler(createTerms));
router.put("/terms/update",checkPermission("cms", "update"), asyncHandler(updateTermsAndConditions));
// ------------------ BLOG (optional) ------------------
router.get("/blogs",checkPermission("cms", "read"), asyncHandler(getAllBlogPosts));
router.get("/blog/:id",checkPermission("cms", "read"), asyncHandler(getBlogPostById));
router.post("/create-blog",checkPermission("cms", "create"), asyncHandler(createBlogPost));
router.put("/update-blog/:id",checkPermission("cms", "update"), asyncHandler(updateBlogPost));
router.delete("/delete-blog/:id",checkPermission("cms", "delete"), asyncHandler(deleteBlogPost));

export default router