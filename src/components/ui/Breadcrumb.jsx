import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import StructuredData, { buildBreadcrumbSchema } from './StructuredData';

/**
 * Breadcrumb — renders a semantic breadcrumb trail with JSON-LD schema.
 *
 * @param {Array} items  - [{ label: string, href?: string }]
 *                         Last item = current page (no link)
 */
export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <>
      {/* JSON-LD BreadcrumbList schema */}
      <StructuredData
        id="jsonld-breadcrumb"
        schema={buildBreadcrumbSchema(items)}
      />

      {/* Visual breadcrumb trail */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-1 text-[11px] text-[#555555] font-light mb-6"
      >
        <ol
          className="flex items-center flex-wrap gap-1"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li
                key={idx}
                className="flex items-center gap-1"
                itemScope
                itemProp="itemListElement"
                itemType="https://schema.org/ListItem"
              >
                {idx === 0 && (
                  <Home className="w-3 h-3 text-[#6F7255] shrink-0" />
                )}

                {isLast ? (
                  <span
                    itemProp="name"
                    aria-current="page"
                    className="text-[#2B2B2B] font-medium"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    itemProp="item"
                    className="hover:text-[#6F7255] transition-colors"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}

                <meta itemProp="position" content={String(idx + 1)} />

                {!isLast && (
                  <ChevronRight className="w-3 h-3 text-[#9E9E9E] shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
