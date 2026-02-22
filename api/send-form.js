/**
 * API Route: /api/send-form
 * Send form data to Telegram bot with UTM tracking
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, phone, telegram, businessType, timestamp, url, 
                utm_source, utm_medium, utm_campaign, utm_content, utm_term } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Name and phone are required'
            });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Missing Telegram configuration');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build UTM string
        const utmParams = [];
        if (utm_source) utmParams.push(`source: ${utm_source}`);
        if (utm_medium) utmParams.push(`medium: ${utm_medium}`);
        if (utm_campaign) utmParams.push(`campaign: ${utm_campaign}`);
        if (utm_content) utmParams.push(`content: ${utm_content}`);
        if (utm_term) utmParams.push(`term: ${utm_term}`);
        
        const utmString = utmParams.length > 0 ? utmParams.join(', ') : '—';

        const messageText = `
🎯 <b>Новая заявка с сайта ChatBot24 Studio</b>

👤 <b>Имя:</b> ${escapeHtml(name)}
📞 <b>Телефон:</b> ${escapeHtml(phone)}
✈️ <b>Telegram:</b> ${escapeHtml(telegram)}
🏢 <b>Тип бизнеса:</b> ${escapeHtml(businessType)}

📊 <b>UTM метки:</b> ${escapeHtml(utmString)}

🕐 <b>Время:</b> ${escapeHtml(timestamp)}
🔗 <b>Источник:</b> ${escapeHtml(url)}
        `.trim();

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            console.error('Telegram API error:', result);
            return res.status(500).json({ 
                error: 'Failed to send message',
                details: result.description || 'Unknown error'
            });
        }

        return res.status(200).json({ 
            success: true,
            message: 'Form submitted successfully'
        });

    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb'
        }
    }
};
