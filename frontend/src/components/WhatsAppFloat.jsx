import React from "react";
import { buildGenericWhatsAppLink } from "../lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={buildGenericWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float-btn"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-wa hover:bg-waDark shadow-xl transition-transform hover:-translate-y-1 flex items-center justify-center"
    >
      <svg width="26" height="26" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.11 17.36c-.32-.16-1.88-.92-2.17-1.02-.29-.11-.5-.16-.71.16-.21.32-.82 1.02-1 1.23-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.88-1.77-2.2-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.53-.71-.54-.19-.01-.4-.01-.61-.01-.21 0-.55.08-.84.4-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.14 3.05 1.29 3.26.16.21 2.25 3.44 5.46 4.83.76.33 1.36.53 1.82.68.77.24 1.47.21 2.03.13.62-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37zM16.02 3C8.83 3 3 8.83 3 16c0 2.28.6 4.42 1.66 6.28L3 29l6.9-1.62A12.94 12.94 0 0 0 16.02 29C23.21 29 29 23.17 29 16S23.21 3 16.02 3zm0 23.63c-1.99 0-3.86-.55-5.46-1.5l-.39-.23-4.09.96 1.09-3.96-.26-.4A10.63 10.63 0 0 1 5.4 16C5.4 10.14 10.16 5.4 16.02 5.4S26.6 10.14 26.6 16c0 5.86-4.76 10.63-10.58 10.63z" />
      </svg>
    </a>
  );
}
