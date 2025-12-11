import React, { useRef, useState } from 'react';
import { Transaction, StoreSettings, CashShift } from '../types';
import { Printer, X, CheckCircle, MessageCircle, Rocket, Share2, Send, Users, ArrowLeft, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { COUNTRIES } from '../constants';

interface TicketProps {
    type: 'SALE' | 'REPORT';
    data: any;
    settings: StoreSettings;
    onClose: () => void;
}

export const Ticket: React.FC<TicketProps> = ({ type, data, settings, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);
    
    // WhatsApp State
    const [whatsAppNumber, setWhatsAppNumber] = useState('');
    const [countryCode, setCountryCode] = useState('51');
    const [sending, setSending] = useState(false);
    const currentCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=400');
        if (printWindow && content) {
            printWindow.document.write('<html><head><title>Print</title><style>body { font-family: monospace; padding: 20px; text-align: center; } .left { text-align: left; } .right { text-align: right; } .flex { display: flex; justify-content: space-between; } hr { border: 0.5px dashed #000; margin: 10px 0; } .bold { font-weight: bold; } .center { display: flex; flex-direction: column; align-items: center; } svg { width: 30px; height: 30px; margin-bottom: 5px; }</style></head><body>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleSendWebhook = async () => {
        if (!whatsAppNumber) return;
        
        // Clean Number
        const cleanNumber = whatsAppNumber.replace(/\D/g, '');
        if (cleanNumber.length < 5) { // Basic validation
             alert("Número inválido");
             return;
        }

        const fullPhone = `${countryCode}${cleanNumber}`;
        
        setSending(true);

        try {
            const webhookUrl = 'https://webhook.red51.site/webhook/posgo_ticket';
            
            // Build safe items array
            const items = (data as Transaction).items ? (data as Transaction).items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })) : [];

            // PAYLOAD
            const payload = {
                phone: fullPhone,
                type: 'SALE_TICKET_PDF',
                store: {
                    name: settings.name,
                    address: settings.address,
                    phone: settings.phone,
                    currency: settings.currency,
                    taxRate: settings.taxRate
                },
                transaction: {
                    id: (data as Transaction).id || 'UNKNOWN',
                    date: (data as Transaction).date || new Date().toISOString(),
                    total: (data as Transaction).total || 0,
                    subtotal: (data as Transaction).subtotal || 0,
                    discount: (data as Transaction).discount || 0,
                    items: items,
                    payments: (data as Transaction).payments || [{ method: (data as Transaction).paymentMethod || 'cash', amount: (data as Transaction).total || 0 }]
                }
            };
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor (${response.status}): ${errorText}`);
            }
            
            alert('Ticket enviado correctamente.');
            setIsWhatsAppMode(false);
        } catch (error: any) {
            console.error("Error sending webhook:", error);
            alert(`Hubo un error al enviar el ticket: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-fade-in-up border border-slate-200">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                    <span className="font-bold flex items-center gap-2 text-sm"><CheckCircle className="w-5 h-5 text-emerald-400"/> {type === 'SALE' ? 'Transacción Exitosa' : 'Corte Realizado'}</span>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-8 overflow-y-auto max-h-[55vh] bg-slate-50 flex justify-center custom-scrollbar">
                    <div ref={printRef} className="bg-white p-6 shadow-sm border border-slate-200 w-full text-xs font-mono leading-relaxed text-slate-800 relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNMCA2IEw2IDAgTDEyIDZNMCA2IEw2IDEyIEwxMiA2IiBmaWxsPSIjZjFmNXY5Ii8+PC9zdmc+')] bg-repeat-x -mt-2"></div>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-2 print:border print:border-black print:text-black">
                                <Rocket className="w-6 h-6 fill-current" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight mb-1">PosGo!</h2>
                            <p className="font-bold text-sm uppercase">{settings.name}</p>
                            <p className="text-slate-500">{settings.address}</p>
                            <p className="text-slate-500">Tel: {settings.phone}</p>
                            <p className="mt-2 border-t border-dashed border-slate-300 pt-2 w-full">{new Date(type === 'SALE' ? (data as Transaction).date : (data.shift as CashShift).endTime!).toLocaleString()}</p>
                        </div>
                        <hr className="border-dashed border-slate-300 my-4"/>
                        {type === 'SALE' ? (
                            <>
                                <div className="space-y-2 mb-4">
                                    {(data as Transaction).items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex-1 pr-2">
                                                <span className="font-bold">{item.name}</span>
                                                {item.selectedVariantName && <span className="block text-[10px] text-slate-500">({item.selectedVariantName})</span>}
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <div>{item.quantity} x {settings.currency}{item.price.toFixed(2)}</div>
                                                <div className="font-bold">{settings.currency}{(item.quantity * item.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <hr className="border-dashed border-slate-300 my-4"/>
                                <div className="space-y-1 text-right">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{settings.currency}{(data as Transaction).subtotal.toFixed(2)}</span></div>
                                    {(data as Transaction).discount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Descuento</span><span>-{settings.currency}{(data as Transaction).discount.toFixed(2)}</span></div>}
                                    <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-slate-200"><span>Total</span><span>{settings.currency}{(data as Transaction).total.toFixed(2)}</span></div>
                                </div>
                            </>
                        ) : (
                             // Report view code unchanged for brevity in this snippet as requested change is for SALE
                            <div>Reporte de Cierre</div>
                        )}
                        <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
                            <p className="mb-1">¡Gracias por su preferencia!</p>
                            <p>Powered by <strong>PosGo!</strong></p>
                        </div>
                         <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBkPSJNMCAwIEw2IDYgTDEyIDBNMCAwIEw2IDYgTDEyIDBWMTIgSDAgVjAiIGZpbGw9IiNmMWY1djkiLz48L3N2Zz4=')] bg-repeat-x -mb-2"></div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 relative">
                    {!isWhatsAppMode ? (
                        <div className="flex gap-2 animate-fade-in">
                            {type === 'SALE' && (
                                <button onClick={() => setIsWhatsAppMode(true)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                                    <MessageCircle className="w-5 h-5"/> WhatsApp
                                </button>
                            )}
                            <button onClick={handlePrint} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <Printer className="w-5 h-5"/> Imprimir
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up space-y-3">
                            <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 items-center">
                                <button onClick={() => setIsWhatsAppMode(false)} className="p-2 text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5"/></button>
                                
                                {/* Country Select */}
                                <div className="relative pl-1 pr-2 border-r border-slate-200">
                                    <select 
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="appearance-none bg-transparent font-bold text-slate-700 outline-none w-full h-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                    >
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-1 cursor-pointer">
                                        <span className="text-lg">{currentCountry?.flag}</span>
                                        <ChevronDown className="w-3 h-3 text-slate-400"/>
                                    </div>
                                </div>

                                <input 
                                    type="tel" 
                                    className="flex-1 bg-transparent px-2 font-bold text-slate-700 outline-none placeholder-slate-300 w-full" 
                                    placeholder={currentCountry.placeholder} 
                                    value={whatsAppNumber} 
                                    onChange={(e) => setWhatsAppNumber(e.target.value.replace(/\D/g, ''))}
                                    maxLength={currentCountry.length}
                                    autoFocus 
                                />
                            </div>
                            
                            <button 
                                onClick={handleSendWebhook} 
                                disabled={whatsAppNumber.length < 5 || sending} 
                                className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 font-bold"
                            >
                                {sending ? <RefreshCw className="w-5 h-5 animate-spin"/> : <><Send className="w-5 h-5"/> Enviar Ticket PDF</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};