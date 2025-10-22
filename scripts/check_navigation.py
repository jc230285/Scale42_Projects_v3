#!/usr/bin/env python3
"""
Check navigation data in Supabase
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def check_navigation():
    try:
        conn = psycopg2.connect(
            host=os.getenv('SUPABASE_DB_HOST'),
            database=os.getenv('SUPABASE_DB_NAME'),
            user=os.getenv('SUPABASE_DB_USER'),
            password=os.getenv('SUPABASE_DB_PASSWORD'),
            port=os.getenv('SUPABASE_DB_PORT', '5432')
        )

        cur = conn.cursor()

        # Check categories
        print("=== CATEGORIES ===")
        cur.execute("SELECT id, name, sort_order FROM public.s42_categories ORDER BY sort_order;")
        categories = cur.fetchall()
        if not categories:
            print("No categories found!")
        else:
            for cat in categories:
                print(f"ID: {cat[0]}, Name: {cat[1]}, Sort: {cat[2]}")

        # Check pages
        print("\n=== PAGES ===")
        cur.execute("SELECT id, title, slug, category_id FROM public.s42_pages ORDER BY title;")
        pages = cur.fetchall()
        if not pages:
            print("No pages found!")
        else:
            for page in pages:
                print(f"ID: {page[0]}, Title: {page[1]}, Slug: {page[2]}, Category: {page[3]}")

        # Check menu items
        print("\n=== MENU ITEMS ===")
        cur.execute("""
            SELECT mi.id, mi.label, mi.href, mi.category_id, c.name as category_name
            FROM public.s42_menu_items mi
            LEFT JOIN public.s42_categories c ON mi.category_id = c.id
            ORDER BY mi.sort_order;
        """)
        menu_items = cur.fetchall()
        if not menu_items:
            print("No menu items found!")
        else:
            for item in menu_items:
                print(f"ID: {item[0]}, Label: {item[1]}, Href: {item[2]}, Category: {item[4]}")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_navigation()