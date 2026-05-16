export type Lang = 'de' | 'ar'

export const t = {
  // Navigation
  dashboard: { de: 'Dashboard', ar: 'لوحة التحكم' },
  employees: { de: 'Mitarbeiter', ar: 'الموظفون' },
  documents: { de: 'Dokumente', ar: 'الوثائق' },
  alerts: { de: 'Benachrichtigungen', ar: 'التنبيهات' },
  settings: { de: 'Einstellungen', ar: 'Einstellungen / الإعدادات' },
  logout: { de: 'Abmelden', ar: 'تسجيل الخروج' },
  adminPanel: { de: 'Verwaltungspanel', ar: 'لوحة الإدارة' },
  employeePortal: { de: 'Mitarbeiterportal', ar: 'بوابة الموظف' },
  myDocuments: { de: 'Meine Dokumente', ar: 'وثائقي' },
  myProfile: { de: 'Mein Profil', ar: 'ملفي الشخصي' },

  // Dashboard
  totalEmployees: { de: 'Mitarbeiter gesamt', ar: 'إجمالي الموظفين' },
  uploadedDocs: { de: 'Hochgeladene Dokumente', ar: 'وثائق مرفوعة' },
  expiringSoon: { de: 'Läuft bald ab', ar: 'تنتهي قريباً' },
  expired: { de: 'Abgelaufen', ar: 'منتهية الصلاحية' },
  urgentAlerts: { de: 'Dringende Benachrichtigungen', ar: 'التنبيهات العاجلة' },
  noAlerts: { de: 'Keine ablaufenden Dokumente', ar: 'لا توجد وثائق تنتهي قريباً' },
  viewAll: { de: 'Alle anzeigen', ar: 'عرض الكل' },
  manageEmployees: { de: 'Mitarbeiter verwalten', ar: 'إدارة الموظفين' },
  within30Days: { de: 'Innerhalb 30 Tage', ar: 'خلال 30 يوم' },
  activeEmployee: { de: 'Aktive Mitarbeiter', ar: 'موظف نشط' },

  // Employees
  addEmployee: { de: 'Mitarbeiter hinzufügen', ar: 'إضافة موظف' },
  searchEmployee: { de: 'Suche nach Name, E-Mail oder Position...', ar: 'بحث بالاسم أو البريد أو الوظيفة...' },
  employee: { de: 'Mitarbeiter', ar: 'الموظف' },
  position: { de: 'Position', ar: 'الوظيفة' },
  department: { de: 'Abteilung', ar: 'القسم' },
  status: { de: 'Status', ar: 'الحالة' },
  actions: { de: 'Aktionen', ar: 'إجراءات' },
  active: { de: '✅ Aktiv', ar: '✅ نشط' },
  inactive: { de: '⏸ Inaktiv', ar: '⏸ موقوف' },
  viewDocuments: { de: 'Dokumente anzeigen', ar: 'عرض الوثائق' },
  noResults: { de: 'Keine Ergebnisse', ar: 'لا توجد نتائج' },
  loading: { de: 'Wird geladen...', ar: 'جارٍ التحميل...' },
  registeredEmployees: { de: 'registrierte Mitarbeiter', ar: 'موظف مسجل' },

  // Add Employee Modal
  addNewEmployee: { de: 'Neuen Mitarbeiter hinzufügen', ar: 'إضافة موظف جديد' },
  fullName: { de: 'Vollständiger Name', ar: 'الاسم الكامل' },
  email: { de: 'E-Mail-Adresse', ar: 'البريد الإلكتروني' },
  phone: { de: 'Telefonnummer', ar: 'رقم الهاتف' },
  startDate: { de: 'Eintrittsdatum', ar: 'تاريخ بداية العمل' },
  cancel: { de: 'Abbrechen', ar: 'إلغاء' },
  save: { de: 'Speichern', ar: 'حفظ' },
  adding: { de: 'Wird hinzugefügt...', ar: 'جارٍ الإضافة...' },
  employeeAdded: { de: 'Mitarbeiter erfolgreich hinzugefügt!', ar: 'تم إضافة الموظف بنجاح!' },
  loginSentTo: { de: 'Zugangsdaten wurden gesendet an', ar: 'تم إرسال بيانات الدخول إلى' },
  tempPassword: { de: 'Temporäres Passwort (bitte notieren):', ar: 'كلمة المرور المؤقتة (احتفظ بها):' },
  close: { de: 'Schließen', ar: 'إغلاق' },
  nameRequired: { de: 'Name und E-Mail sind erforderlich', ar: 'الاسم والبريد مطلوبان' },
  emailExists: { de: 'E-Mail bereits registriert', ar: 'البريد الإلكتروني مسجل بالفعل' },

  // Documents
  document: { de: 'Dokument', ar: 'الوثيقة' },
  expiryDate: { de: 'Ablaufdatum', ar: 'تاريخ الانتهاء' },
  issueDate: { de: 'Ausstellungsdatum', ar: 'تاريخ الإصدار' },
  uploadDocument: { de: 'Dokument hochladen', ar: 'رفع الوثيقة' },
  updateDocument: { de: 'Aktualisieren', ar: 'تحديث' },
  viewDocument: { de: 'Anzeigen', ar: 'عرض' },
  review: { de: 'Überprüfen', ar: 'مراجعة' },
  approve: { de: '✅ Genehmigen', ar: '✅ قبول' },
  reject: { de: '❌ Ablehnen', ar: '❌ رفض' },
  notes: { de: 'Anmerkungen (optional)...', ar: 'ملاحظات (اختياري)...' },
  uploading: { de: 'Wird hochgeladen...', ar: 'جارٍ الرفع...' },
  dropFile: { de: 'Datei hier ablegen oder klicken', ar: 'اسحب الملف هنا أو اضغط للاختيار' },
  fileTypes: { de: 'JPG · PNG · PDF · max. 10MB', ar: 'JPG · PNG · PDF · حتى 10MB' },
  noExpiry: { de: 'Kein Ablaufdatum', ar: 'لا تنتهي صلاحيتها' },
  optional: { de: 'Optional', ar: 'اختياري' },
  required: { de: 'Pflichtfeld', ar: 'مطلوب' },
  expiryRequired: { de: 'Ablaufdatum ist erforderlich', ar: 'يجب إدخال تاريخ الانتهاء' },

  // Document Status
  valid: { de: 'Gültig', ar: 'سارية' },
  expiringSoonBadge: { de: 'Läuft bald ab', ar: 'تنتهي قريباً' },
  expiredBadge: { de: 'Abgelaufen', ar: 'منتهية' },
  missing: { de: 'Fehlend', ar: 'مفقودة' },
  rejected: { de: 'Abgelehnt', ar: 'مرفوضة' },
  pending: { de: 'Ausstehend', ar: 'بانتظار المراجعة' },

  // Days
  daysLeft: { de: 'Tage verbleibend', ar: 'يوم متبقي' },
  expiredDaysAgo: { de: 'Abgelaufen vor', ar: 'انتهت منذ' },
  days: { de: 'Tagen', ar: 'يوم' },

  // Alerts
  allAlerts: { de: 'Alle Benachrichtigungen', ar: 'جميع التنبيهات' },
  needsAttention: { de: 'Dokument benötigt Aufmerksamkeit', ar: 'وثيقة تحتاج انتباه' },
  sendReminder: { de: 'Erinnerung senden', ar: 'إرسال تذكير' },
  sendAllReminders: { de: 'Alle Erinnerungen senden', ar: 'إرسال كل التذكيرات' },
  reminderSent: { de: 'Erinnerung gesendet ✓', ar: 'تم الإرسال ✓' },
  expiredSection: { de: 'Abgelaufen', ar: 'منتهية الصلاحية' },
  expiringSoonSection: { de: 'Läuft bald ab (30 Tage)', ar: 'تنتهي خلال 30 يوم' },
  noAlertsAll: { de: 'Alle Dokumente sind gültig', ar: 'كل الوثائق سارية' },
  noAlertsDesc: { de: 'Keine Dokumente laufen in den nächsten 30 Tagen ab', ar: 'لا توجد وثائق تنتهي خلال الـ 30 يوم القادمة' },
  viewProfile: { de: 'Profil anzeigen', ar: 'عرض الملف' },
  expiresOn: { de: 'Läuft ab am', ar: 'تاريخ الانتهاء:' },

  // Employee Detail
  back: { de: 'Zurück', ar: 'رجوع' },
  sendReminders: { de: '📨 Erinnerungen senden', ar: '📨 إرسال تذكيرات' },
  deactivateAccount: { de: 'Konto deaktivieren', ar: 'إيقاف الحساب' },
  activateAccount: { de: 'Konto aktivieren', ar: 'تفعيل الحساب' },

  // Settings / Profile
  changePassword: { de: 'Passwort ändern', ar: 'تغيير كلمة المرور' },
  currentPassword: { de: 'Aktuelles Passwort', ar: 'كلمة المرور الحالية' },
  newPassword: { de: 'Neues Passwort', ar: 'كلمة المرور الجديدة' },
  confirmPassword: { de: 'Passwort bestätigen', ar: 'تأكيد كلمة المرور الجديدة' },
  passwordChanged: { de: 'Passwort erfolgreich geändert ✅', ar: 'تم تغيير كلمة المرور بنجاح ✅' },
  passwordMismatch: { de: 'Passwörter stimmen nicht überein', ar: 'كلمتا المرور غير متطابقتين' },
  passwordTooShort: { de: 'Passwort muss mindestens 8 Zeichen haben', ar: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
  saving: { de: 'Wird gespeichert...', ar: 'جارٍ الحفظ...' },
  minChars: { de: 'Mindestens 8 Zeichen', ar: '8 أحرف على الأقل' },
  notificationSettings: { de: 'Benachrichtigungseinstellungen', ar: 'إعدادات الإشعارات' },
  requiredDocTypes: { de: 'Erforderliche Dokumententypen', ar: 'أنواع الوثائق المطلوبة' },
  hasExpiry: { de: 'Hat Ablaufdatum', ar: 'لها تاريخ انتهاء' },
  noExpiryLabel: { de: 'Kein Ablaufdatum', ar: 'دائمة' },

  // Login
  loginTitle: { de: 'Dokumentenverwaltung', ar: 'نظام إدارة الوثائق' },
  loginSubtitle: { de: 'Melden Sie sich an, um fortzufahren', ar: 'سجّل دخولك للمتابعة' },
  loginButton: { de: 'Anmelden', ar: 'تسجيل الدخول' },
  loggingIn: { de: 'Anmeldung läuft...', ar: 'جارٍ تسجيل الدخول...' },
  loginError: { de: 'E-Mail oder Passwort ist falsch', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
  connectionError: { de: 'Verbindungsfehler', ar: 'خطأ في الاتصال' },
  allRightsReserved: { de: 'Alle Rechte vorbehalten', ar: 'جميع الحقوق محفوظة' },
  documentSystem: { de: 'Mitarbeiter-Dokumentensystem', ar: 'نظام وثائق الموظفين' },

  // Employee portal stats
  uploaded: { de: 'Hochgeladen', ar: 'مرفوعة' },
  missingDocs: { de: 'Fehlend', ar: 'ناقصة' },
  uploadInstructions: { de: 'Anweisungen zum Hochladen', ar: 'تعليمات رفع الوثائق' },

  // Document types
  personalausweis: { de: 'Personalausweis', ar: 'بطاقة الهوية' },
  steuerid: { de: 'Steuer-ID', ar: 'الرقم الضريبي' },
  svnummer: { de: 'Sozialversicherungsnummer', ar: 'رقم التأمين الاجتماعي' },
  fuehrerschein: { de: 'Führerschein', ar: 'رخصة القيادة' },
  versicherungskarte: { de: 'Versicherungskarte', ar: 'بطاقة التأمين الصحي' },
  bankkarte: { de: 'Bankkarte / IBAN', ar: 'بيانات الحساب البنكي' },
  aufenthaltstitel: { de: 'Aufenthaltstitel', ar: 'الإقامة' },
  arbeitsvertrag: { de: 'Arbeitsvertrag', ar: 'عقد العمل' },

  // Server errors
  serverError: { de: 'Serverfehler', ar: 'خطأ في الخادم' },
  unauthorized: { de: 'Nicht autorisiert', ar: 'غير مصرح' },
}

export function tr(key: keyof typeof t, lang: Lang): string {
  return t[key]?.[lang] || t[key]?.['de'] || key
}
