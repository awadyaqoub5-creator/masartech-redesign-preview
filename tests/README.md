# اختبارات المتصفح (playwright-cli)

شغّل الموقع محليًا على المنفذ 8765:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

بعدها افتح المتصفح:

```bash
playwright-cli open http://localhost:8765/
```

- **flows.js:** يجرب المسارات المهمة بالضغط الفعلي، وهي:
  1. القائمة الرئيسية وقائمة الجوال.
  2. السلايدر.
  3. فلاتر الدورات وحفظها في الرابط.
  4. التبويبات بلوحة المفاتيح.
  5. المحتويات والأسئلة.
  6. شريط الأقسام.
  7. السلة ثم الدفع.
  8. نموذج التقييم.
  9. نموذج التواصل.
  10. بحث المدونة.

  شغّله على الكمبيوتر:

  ```bash
  playwright-cli resize 1366 900
  ```

  ```bash
  playwright-cli run-code --filename=tests/flows.js
  ```

  وشغّله على الجوال:

  ```bash
  playwright-cli resize 390 844
  ```

  ```bash
  playwright-cli run-code --filename=tests/flows.js
  ```

- **crawl.js:** يمر على كل الصفحات (القائمة في pages.json) ويسجل أخطاء JS والطلبات الفاشلة والصور المكسورة والتمرير الأفقي. كل صفحة لازم يكون فيها h1 واحد. لو زادت الصفحات أو نقصت، حدّث pages.json.

  ```bash
  playwright-cli run-code --filename=tests/crawl.js
  ```

  الصفحة `course.html` تحويل تلقائي (meta refresh). استبعدها من القائمة لو قاطعت الصفحات اللي بعدها.
