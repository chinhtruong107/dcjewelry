"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translateText } from "@/lib/i18n";
import { useEffect } from "react";

const translatedAttributes = ["aria-label", "placeholder", "title", "alt"] as const;
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const originalTextByNode = new WeakMap<Text, string>();
const lastTextByNode = new WeakMap<Text, string>();
const originalAttributesByElement = new WeakMap<Element, Map<string, string>>();
const lastAttributesByElement = new WeakMap<Element, Map<string, string>>();

function shouldIgnore(element: Element | null) {
  return !element
    || ignoredTags.has(element.tagName)
    || element.closest("[data-no-translate], [contenteditable='true']") !== null;
}

export default function LanguageDomBridge() {
  const { language } = useLanguage();

  useEffect(() => {
    const translateTextNode = (node: Text) => {
      if (shouldIgnore(node.parentElement)) return;

      const currentValue = node.nodeValue ?? "";
      const lastValue = lastTextByNode.get(node);
      let originalValue = originalTextByNode.get(node);

      if (originalValue === undefined || (lastValue !== undefined && currentValue !== lastValue && currentValue !== originalValue)) {
        originalValue = currentValue;
        originalTextByNode.set(node, originalValue);
      }

      const translatedValue = translateText(originalValue, language);

      if (translatedValue !== currentValue) {
        node.nodeValue = translatedValue;
      }

      lastTextByNode.set(node, translatedValue);
    };

    const translateAttributes = (element: Element) => {
      if (shouldIgnore(element)) return;

      const originalAttributes = originalAttributesByElement.get(element) ?? new Map<string, string>();
      const lastAttributes = lastAttributesByElement.get(element) ?? new Map<string, string>();
      originalAttributesByElement.set(element, originalAttributes);
      lastAttributesByElement.set(element, lastAttributes);

      for (const attribute of translatedAttributes) {
        const currentValue = element.getAttribute(attribute);
        if (!currentValue) continue;

        const lastValue = lastAttributes.get(attribute);
        let originalValue = originalAttributes.get(attribute);

        if (originalValue === undefined || (lastValue !== undefined && currentValue !== lastValue && currentValue !== originalValue)) {
          originalValue = currentValue;
          originalAttributes.set(attribute, originalValue);
        }

        const translatedValue = translateText(originalValue, language);
        if (translatedValue !== currentValue) {
          element.setAttribute(attribute, translatedValue);
        }

        lastAttributes.set(attribute, translatedValue);
      }
    };

    const translateTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root as Text);
        return;
      }

      if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

      if (root.nodeType === Node.ELEMENT_NODE) {
        translateAttributes(root as Element);
      }

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode();

      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          translateTextNode(currentNode as Text);
        } else {
          translateAttributes(currentNode as Element);
        }

        currentNode = walker.nextNode();
      }
    };

    translateTree(document.body);
    document.title = translateText(document.title, language);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target as Text);
          continue;
        }

        if (mutation.type === "attributes") {
          translateAttributes(mutation.target as Element);
          continue;
        }

        mutation.addedNodes.forEach(translateTree);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...translatedAttributes],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}
