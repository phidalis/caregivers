// ==========================================
// MERCY SENIOR SOLUTIONS - Email Notifications (client side)
// Reads email templates from Firestore (settings/emailTemplates),
// renders them with form data, and sends them through the Render
// API endpoint (/api/send-email) which uses Resend.
//
// If email sending fails, forms still work normally - the failure
// is only logged to the console.
// ==========================================

window.EmailNotifications = (function() {

    // The Render server serves both the website and this endpoint on the
    // same domain, so a relative URL works. If the site is ever hosted
    // somewhere else, set this to the full Render URL, e.g.:
    // 'https://your-app.onrender.com/api/send-email'
    var EMAIL_API_URL = '/api/send-email';

    var SITE_NAME = 'Mercy Senior Solutions';
    var SITE_PHONE = '(341) 618-9792';
    var SITE_EMAIL = 'info@mercyseniorsolutions.com';

    var TYPES = {
        care_request: 'Care Request',
        find_care: 'Find Care Request',
        provider: 'Provider Application',
        career: 'Career Application',
        contact: 'Contact Message'
    };

    var DEFAULT_TEMPLATES = {
        fromName: SITE_NAME,
        adminEmail: SITE_EMAIL,
        templates: {
            care_request: {
                clientSubject: 'We received your care request, {{name}}',
                clientBody: 'Hello {{name}},\n\nThank you for contacting {{site}} about care for your loved one. We have received your request and a senior care advisor will reach out to you within 24 hours to discuss the best care options for your family.\n\nIf you have questions in the meantime, call us at {{sitePhone}} or reply to this email.\n\nWarm regards,\nThe {{site}} Team',
                adminSubject: 'New Care Request from {{name}}',
                adminBody: 'A new care request was submitted on {{site}}.\n\n{{details}}\n\nPlease review this request and follow up with the family within 24 hours.'
            },
            find_care: {
                clientSubject: 'We received your care request, {{name}}',
                clientBody: 'Hello {{name}},\n\nThank you for using {{site}} to find care options for your loved one. We have received your request and will match you with facilities that meet your needs.\n\nA senior care advisor will contact you within 24 hours. For immediate assistance, call us at {{sitePhone}}.\n\nWarm regards,\nThe {{site}} Team',
                adminSubject: 'New Find Care Request from {{name}}',
                adminBody: 'A new facility request was submitted on {{site}}.\n\n{{details}}\n\nPlease review this request and follow up with the family.'
            },
            provider: {
                clientSubject: 'Your partnership application has been received',
                clientBody: 'Hello {{name}},\n\nThank you for applying to partner with {{site}}. Our partnerships team has received your application and will review it within 48 hours.\n\nWe look forward to working together to serve more families.\n\nIf you have any questions, call us at {{sitePhone}}.\n\nWarm regards,\nThe {{site}} Team',
                adminSubject: 'New Provider Application: {{name}}',
                adminBody: 'A new provider partnership application was submitted on {{site}}.\n\n{{details}}\n\nPlease review and follow up with this provider.'
            },
            career: {
                clientSubject: 'Your application has been received, {{name}}',
                clientBody: 'Hello {{name}},\n\nThank you for applying to join the {{site}} team. We have received your application and our HR team will review it and reach out to you within 48 hours.\n\nWe appreciate your interest in serving families with compassion.\n\nWarm regards,\nThe {{site}} Team',
                adminSubject: 'New Career Application from {{name}}',
                adminBody: 'A new career application was submitted on {{site}}.\n\n{{details}}\n\nPlease review and follow up with this applicant.'
            },
            contact: {
                clientSubject: 'We received your message',
                clientBody: 'Hello {{name}},\n\nThank you for reaching out to {{site}}. We have received your message and will respond within 24 hours.\n\nFor urgent matters, call us at {{sitePhone}}.\n\nWarm regards,\nThe {{site}} Team',
                adminSubject: 'New Contact Message from {{name}}',
                adminBody: 'A new message was submitted through the {{site}} website.\n\n{{details}}\n\nPlease review and respond to this message.'
            }
        }
    };

    var FIELD_LABELS = {
        name: 'Full Name',
        facilityName: 'Facility Name',
        licenseNumber: 'License Number',
        admissionsDirector: 'Admissions Director',
        email: 'Email',
        phone: 'Phone',
        city: 'City',
        state: 'State',
        careType: 'Care Type',
        hoursNeeded: 'Hours Needed',
        daysNeeded: 'Days Needed',
        startDate: 'Preferred Start Date',
        budget: 'Budget',
        notes: 'Additional Comments',
        address: 'Address',
        experience: 'Experience',
        availability: 'Availability',
        references: 'References',
        certifications: 'Certifications',
        paymentOptions: 'Payment Options',
        familyGroup: 'Care Is For',
        addons: 'Add-on Services',
        subject: 'Subject',
        message: 'Message',
        backgroundCheckConsent: 'Background Check Consent'
    };

    var SKIP_KEYS = ['source', 'status', 'type', 'createdAt', 'updatedAt'];

    // ---------- Helpers ----------

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(text == null ? '' : text)));
        return div.innerHTML;
    }

    function humanizeLabel(key) {
        if (FIELD_LABELS[key]) return FIELD_LABELS[key];
        return String(key).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, function(c) { return c.toUpperCase(); }).trim();
    }

    function formatValue(val) {
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (val == null) return '';
        return String(val);
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function replacePlaceholders(text, values) {
        var result = String(text || '');
        Object.keys(values).forEach(function(key) {
            if (key === 'details') return;
            var re = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
            result = result.replace(re, String(values[key] == null ? '' : values[key]));
        });
        return result;
    }

    function buildDetailsHtml(data) {
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Arial,Helvetica,sans-serif;color:#333;">';
        Object.keys(data || {}).forEach(function(key) {
            if (SKIP_KEYS.indexOf(key) !== -1) return;
            var val = formatValue(data[key]);
            if (!val) return;
            html += '<tr>' +
                '<td style="padding:7px 10px;background:#F5F7FA;font-weight:bold;width:35%;border:1px solid #E5E7EB;vertical-align:top;">' + escapeHtml(humanizeLabel(key)) + '</td>' +
                '<td style="padding:7px 10px;border:1px solid #E5E7EB;">' + escapeHtml(val) + '</td>' +
                '</tr>';
        });
        html += '</table>';
        return html;
    }

    // Renders a template body into styled HTML email content.
    // {{details}} is replaced with the raw submission table.
    function renderBody(body, values, detailsHtml) {
        var lines = String(body || '').split('\n');
        var out = '';
        lines.forEach(function(rawLine) {
            var line = rawLine.trim();
            if (!line) return;
            var hasDetails = line.indexOf('{{details}}') !== -1;
            var text = replacePlaceholders(line.split('{{details}}').join(''), values).trim();
            if (hasDetails) {
                if (text) out += '<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333;">' + escapeHtml(text) + '</p>';
                out += detailsHtml;
            } else {
                out += '<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333;">' + escapeHtml(text) + '</p>';
            }
        });
        return out;
    }

    function wrapEmail(bodyHtml, previewLabel) {
        var badge = previewLabel ? '<div style="text-align:center;padding:8px;background:#D4A33A;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1px;">' + escapeHtml(previewLabel.toUpperCase()) + '</div>' : '';
        return '' +
            '<div style="background:#F5F7FA;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">' +
            '<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">' +
            badge +
            '<div style="background:#081B3A;padding:22px 24px;text-align:center;">' +
            '<span style="color:#ffffff;font-size:20px;font-weight:bold;font-family:Georgia,serif;">Mercy <span style="color:#D4A33A;">Senior</span> Solutions</span>' +
            '</div>' +
            '<div style="padding:26px 28px;">' + bodyHtml +
            '</div>' +
            '<div style="background:#F5F7FA;padding:16px 20px;text-align:center;color:#6B7280;font-size:12px;font-family:Arial,Helvetica,sans-serif;">' +
            escapeHtml(SITE_NAME) + ' &nbsp;|&nbsp; ' + escapeHtml(SITE_PHONE) + ' &nbsp;|&nbsp; ' + escapeHtml(SITE_EMAIL) +
            '</div>' +
            '</div></div>';
    }

    function loadConfig() {
        return db.collection('settings').doc('emailTemplates').get().then(function(doc) {
            var merged = deepClone(DEFAULT_TEMPLATES);
            if (doc.exists) {
                var saved = doc.data() || {};
                if (saved.fromName) merged.fromName = saved.fromName;
                if (saved.adminEmail) merged.adminEmail = saved.adminEmail;
                if (saved.templates) {
                    Object.keys(TYPES).forEach(function(key) {
                        if (saved.templates[key]) {
                            merged.templates[key] = Object.assign({}, merged.templates[key], saved.templates[key]);
                        }
                    });
                }
            }
            return merged;
        }).catch(function() {
            return deepClone(DEFAULT_TEMPLATES);
        });
    }

    function saveConfig(config) {
        return FirebaseServices.settings.update('emailTemplates', config);
    }

    function collectValues(data) {
        var now = new Date();
        return {
            name: data.name || data.facilityName || 'there',
            email: data.email || '',
            phone: data.phone || '',
            city: data.city || '',
            careType: data.careType || '',
            site: SITE_NAME,
            sitePhone: SITE_PHONE,
            siteEmail: SITE_EMAIL,
            date: now.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
    }

    function postMessages(messages, replyTo) {
        return fetch(EMAIL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages, replyTo: replyTo || undefined })
        }).then(function(res) {
            return res.json().catch(function() { return null; });
        }).then(function(result) {
            if (result && result.ok) {
                console.log('Email notifications sent:', messages.map(function(m) { return m.to; }).join(', '));
                return true;
            }
            console.warn('Email notification failed:', result);
            return false;
        }).catch(function(err) {
            console.warn('Email notification error:', err);
            return false;
        });
    }

    // ---------- Public API ----------

    function getTypes() {
        return deepClone(TYPES);
    }

    function getDefaults() {
        return deepClone(DEFAULT_TEMPLATES);
    }

    // Sends both the client confirmation email and the admin notification
    // for a form submission.
    function send(type, data) {
        if (typeof db === 'undefined' || !db.collection) return Promise.resolve(false);
        return loadConfig().then(function(config) {
            var tpl = config.templates[type];
            if (!tpl) return false;
            var typeLabel = TYPES[type] || type;
            var values = collectValues(data || {});
            var detailsHtml = buildDetailsHtml(data || {});
            var clientEmail = (data && data.email) || '';
            var adminEmail = config.adminEmail || SITE_EMAIL;

            var messages = [];
            if (clientEmail) {
                messages.push({
                    to: clientEmail,
                    subject: replacePlaceholders(tpl.clientSubject, values),
                    html: wrapEmail(renderBody(tpl.clientBody, values, detailsHtml), 'Your request is received')
                });
            }
            if (adminEmail) {
                messages.push({
                    to: adminEmail,
                    subject: replacePlaceholders(tpl.adminSubject || 'New ' + typeLabel, values),
                    html: wrapEmail(renderBody(tpl.adminBody || '{{details}}', values, detailsHtml), 'Admin Notification - ' + typeLabel)
                });
            }
            if (messages.length === 0) return false;
            return postMessages(messages, clientEmail || undefined);
        });
    }

    // Sends the client confirmation email for a type to a specific address
    // (used by the admin "Send Test" button).
    function sendTest(type, email) {
        if (typeof db === 'undefined' || !db.collection) return Promise.resolve(false);
        return loadConfig().then(function(config) {
            var tpl = config.templates[type];
            if (!tpl) return false;
            var typeLabel = TYPES[type] || type;
            var values = collectValues({ name: 'Test User', email: email });
            var detailsHtml = buildDetailsHtml({
                name: 'Test User',
                email: email,
                phone: '(555) 123-4567',
                careType: 'Companion Care',
                notes: 'This is a test submission.'
            });
            var message = {
                to: email,
                subject: '[TEST] ' + replacePlaceholders(tpl.clientSubject, values),
                html: wrapEmail(renderBody(tpl.clientBody, values, detailsHtml), 'Test - ' + typeLabel)
            };
            return postMessages([message], undefined);
        });
    }

    return {
        getTypes: getTypes,
        getDefaults: getDefaults,
        load: loadConfig,
        save: saveConfig,
        send: send,
        sendTest: sendTest
    };
})();
