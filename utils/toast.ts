import { addToast } from "@heroui/toast";
import { ReactNode } from "react";

/**
 * 显示成功 Toast
 */
export function showSuccessToast(
  title: string,
  description?: string,
  endContent?: ReactNode,
) {
  addToast({
    title,
    description,
    endContent,
    color: "success",
    timeout: 3000,
  });
}

/**
 * 显示警告 Toast
 */
export function showWarningToast(
  title: string,
  description?: string,
  endContent?: ReactNode,
) {
  addToast({
    title,
    description,
    endContent,
    color: "warning",
    timeout: 4000,
  });
}

/**
 * 显示错误 Toast
 */
export function showErrorToast(
  title: string,
  description?: string,
  endContent?: ReactNode,
) {
  addToast({
    title,
    description,
    endContent,
    color: "danger",
    timeout: 5000,
  });
}

/**
 * 显示信息 Toast
 */
export function showInfoToast(
  title: string,
  description?: string,
  endContent?: ReactNode,
) {
  addToast({
    title,
    description,
    endContent,
    color: "default",
    timeout: 3000,
  });
}
