import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.js";

import privacyPolicyModel from "../../models/admin-model/cms-control-system/model.privacyPolicy.js";
import termsModel from "../../models/admin-model/cms-control-system/model.terms.js";
import blogModel from "../../models/admin-model/cms-control-system/model.blog.js";
import faqModel from "../../models/admin-model/cms-control-system/model.faq.js";
import aboutPageModel from "../../models/admin-model/cms-control-system/model.aboutpage.js";
import homeBannerModel from "../../models/admin-model/cms-control-system/model.homeBanner.js";

const getHomeBanners = async (req, res) => {
  try {
    const data = await homeBannerModel.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createHomeBanner = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: "Image is required" });
    }

    const cloudinaryResponse = await uploadToCloudinary(req.file.path);

    if (!cloudinaryResponse) {
      return res.status(500).json({ success: false, error: "Failed to upload image to Cloudinary" });
    }

    const result = await homeBannerModel.create({
      title,
      image: cloudinaryResponse.secure_url,
      imagePublicId: cloudinaryResponse.public_id
    });

    res.json({ success: true, message: "Banner created", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateHomeBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const { id } = req.params;

    const existingBanner = await homeBannerModel.getById(id);

    if (!existingBanner) {
      return res.status(404).json({ success: false, error: "Banner not found" });
    }

    let imageUrl = existingBanner.image;
    let imagePublicId = existingBanner.image_public_id; // Note: field name in DB

    if (req.file) {
      if (existingBanner.image_public_id) {
        await deleteFromCloudinary(existingBanner.image_public_id);
      }

      const cloudinaryResponse = await uploadToCloudinary(req.file.path);

      if (!cloudinaryResponse) {
        return res.status(500).json({ success: false, error: "Failed to upload image to Cloudinary" });
      }

      imageUrl = cloudinaryResponse.secure_url;
      imagePublicId = cloudinaryResponse.public_id;
    }

    const result = await homeBannerModel.update(id, {
      title: title || existingBanner.title,
      image: imageUrl,
      imagePublicId: imagePublicId
    });

    res.json({ success: true, message: "Banner updated", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await homeBannerModel.getById(id);

    if (!banner) {
      return res.status(404).json({ success: false, error: "Banner not found" });
    }

    if (banner.image_public_id) {
      await deleteFromCloudinary(banner.image_public_id);
    }

    const result = await homeBannerModel.delete(id);

    res.json({ success: true, message: "Banner deleted", result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// About Page
const createAboutPage = async (req, res) => {
  try {
    const content = req.body.content;

    const existing = await aboutPageModel.get();
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "About page already exists" });
    }

    const result = await aboutPageModel.create(content);
    res
      .status(201)
      .json({ success: true, message: "About page created", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAboutPage = async (req, res) => {
  try {
    const result = await aboutPageModel.get();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAboutPage = async (req, res) => {
  try {
    const content = req.body.content;
    const result = await aboutPageModel.update(content);
    res
      .status(200)
      .json({ success: true, message: "About page updated", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// blog post
const getAllBlogPosts = async (req, res) => {
  try {
    const blogPosts = await blogModel.getAll();
    res.status(200).json({ success: true, data: blogPosts });
  } catch (error) {
    res.status(500).json({ message: "Error Retriving Blog Posts", error });
  }
};

// get a single blog post by id
const getBlogPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const blogPost = await blogModel.getById(id);
    if (blogPost) {
      res.status(200).json(blogPost);
    } else {
      res.status(404).json({ message: "Blog post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the blog post", error });
  }
};

// create the blog post
const createBlogPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await blogModel.create({ title, content });
    res.status(200).json({ message: "Blog Post created Successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Error creating blog post", error });
  }
};

// update an existing blog post
const updateBlogPost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await blogModel.update(id, { title, content });
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Blog post updated Successfully" });
    } else {
      res.status(404).json({ message: "Blog post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating blog post", error });
  }
};

// Delete A blog Post
const deleteBlogPost = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await blogModel.delete(id);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Blog Post deleted Successfuuly" });
    } else {
      res.status(404).json({ message: "Blog Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error Deleting Blog Post", error });
  }
};

// get All FAQs
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await faqModel.getAll();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving FAQs", error });
  }
};

// get by Id
const getFAQById = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await faqModel.getById(id);
    if (faq) {
      res.status(200).json(faq);
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving FAQ", error });
  }
};

// Create a new FAQ
const createFAQ = async (req, res) => {
  const { question, answer } = req.body;
  try {
    const result = await faqModel.create({ question, answer });
    res.status(201).json({ message: "FAQ created successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Error creating FAQ", error });
  }
};

// Update an existing FAQ
const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  try {
    const result = await faqModel.update(id, { question, answer });
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "FAQ updated successfully" });
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating FAQ", error });
  }
};

// Delete an FAQ
const deleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await faqModel.delete(id);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "FAQ deleted successfully" });
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting FAQ", error });
  }
};

// Privacy Policy
// Get privacy policy
const createPrivacyPolicy = async (req, res) => {
  try {
    const { content } = req.body;

    const result = await privacyPolicyModel.create(content);

    res.status(201).json({
      success: true,
      message: "Privacy policy created successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await privacyPolicyModel.get();
    res.status(200).json(privacyPolicy);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving privacy policy", error });
  }
};

// Update privacy policy
const updatePrivacyPolicy = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await privacyPolicyModel.update(content);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Privacy policy updated successfully" });
    } else {
      res.status(404).json({ message: "Privacy policy not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating privacy policy", error });
  }
};

// Terms & Condition
const createTerms = async (req, res) => {
  try {
    const { content } = req.body;

    const result = await termsModel.create(content);

    res.status(201).json({
      success: true,
      message: "Terms & Conditions created successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get terms and conditions
const getTermsAndConditions = async (req, res) => {
  try {
    const terms = await termsModel.get();
    res.status(200).json(terms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving terms and conditions", error });
  }
};

// Update terms and conditions
const updateTermsAndConditions = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await termsModel.update(content);
    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: "Terms and conditions updated successfully" });
    } else {
      res.status(404).json({ message: "Terms and conditions not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating terms and conditions", error });
  }
};

export default {
  getHomeBanners,
  createHomeBanner,
  deleteHomeBanner,
  updateHomeBanner,
  createAboutPage,
  getAboutPage,
  updateAboutPage,
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getTermsAndConditions,
  updateTermsAndConditions,
  createTerms,
  createPrivacyPolicy
}