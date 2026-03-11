import { z } from 'zod';

export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_TEST_CONTENT_LENGTH = 15000;

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message must be under ${MAX_MESSAGE_LENGTH} characters`)
});

export const testContentSchema = z.object({
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(MAX_TEST_CONTENT_LENGTH, `Content must be under ${MAX_TEST_CONTENT_LENGTH} characters`)
});

export function validateMessage(content: string, language: 'ar' | 'en'): { valid: boolean; error?: string } {
  const result = messageSchema.safeParse({ content });
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue.code === 'too_big') {
      return {
        valid: false,
        error: language === 'ar'
          ? `الرسالة طويلة جداً (الحد الأقصى ${MAX_MESSAGE_LENGTH} حرف)`
          : `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
      };
    }
    return {
      valid: false,
      error: language === 'ar' ? 'الرسالة غير صالحة' : 'Invalid message'
    };
  }
  return { valid: true };
}

export function validateTestContent(content: string, language: 'ar' | 'en'): { valid: boolean; error?: string } {
  const result = testContentSchema.safeParse({ content });
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue.code === 'too_big') {
      return {
        valid: false,
        error: language === 'ar'
          ? `المحتوى طويل جداً (الحد الأقصى ${MAX_TEST_CONTENT_LENGTH} حرف)`
          : `Content too long (max ${MAX_TEST_CONTENT_LENGTH} characters)`
      };
    }
    return {
      valid: false,
      error: language === 'ar' ? 'المحتوى غير صالح' : 'Invalid content'
    };
  }
  return { valid: true };
}
