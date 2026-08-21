 "use client";

import { useMemo, useState } from "react";

type Item = { description: string; qty: number; price: number };
type Invoice = {
  id: string; customer: string; phone: string; date: string;
  items: Item[]; gst: number; status: "Pending" | "Paid";
};

const money = (n:number) => new Intl.NumberFormat("en-SG",{style:"currency",currency:"SGD"}).format(n);

export default function Home() {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<Item[]>([{description:"Pool maintenance",qty:1,price:850}]);
  const [gst, setGst] = useState(9);
  const [status, setStatus] = useState<"Pending"|"Paid">("Pending");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prompt, setPrompt] = useState("");

  const subtotal = useMemo(()=>items.reduce((s,i)=>s+i.qty*i.price,0),[items]);
  const tax = subtotal * gst / 100;
  const total = subtotal + tax;

  function addItem(){setItems([...items,{description:"",qty:1,price:0}]);}
  function update(i:number,k:keyof Item,v:string){
    const copy=[...items]; copy[i]={...copy[i], [k]: k==="description"?v:Number(v)}; setItems(copy);
  }
  function save(){
    const inv:Invoice={id:`INV-${Date.now().toString().slice(-6)}`,customer,phone,date:new Date().toISOString().slice(0,10),items,gst,status};
    setInvoices([inv,...invoices]); setCustomer(""); setPhone("");
  }
  async function parseAI(){
    if(!prompt.trim()) return;
    const r=await fetch("/api/parse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:prompt})});
    const d=await r.json();
    if(d.customer) setCustomer(d.customer);
    if(d.phone) setPhone(d.phone);
    if(d.items?.length) setItems(d.items);
  }

  return <main>
    <header><div className="brand">InvoiceFlow <span>AI</span></div><nav>Dashboard&nbsp;&nbsp; Invoices&nbsp;&nbsp; Customers</nav></header>
    <section className="hero">
      <div><p className="eyebrow">AI INVOICE AUTOMATION</p><h1>Create professional invoices in seconds.</h1>
      <p className="sub">Type what you need, review the details, then generate your invoice. Built for service businesses.</p></div>
      <div className="aiBox"><label>Describe the invoice</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder='“Create an invoice for ABC Pte Ltd, $850 for pool maintenance”'/><button onClick={parseAI}>Parse with AI →</button></div>
    </section>

    <section className="grid">
      <div className="card">
        <div className="cardHead"><h2>New invoice</h2><span>SGD • GST {gst}%</span></div>
        <div className="two"><input placeholder="Customer name" value={customer} onChange={e=>setCustomer(e.target.value)}/><input placeholder="WhatsApp / phone" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
        <div className="items">{items.map((it,i)=><div className="item" key={i}><input placeholder="Description" value={it.description} onChange={e=>update(i,"description",e.target.value)}/><input type="number" min="1" value={it.qty} onChange={e=>update(i,"qty",e.target.value)}/><input type="number" min="0" value={it.price} onChange={e=>update(i,"price",e.target.value)}/></div>)}</div>
        <button className="ghost" onClick={addItem}>+ Add item</button>
        <div className="totals"><div>Subtotal <b>{money(subtotal)}</b></div><div>GST <b>{money(tax)}</b></div><div className="grand">Total <b>{money(total)}</b></div></div>
        <div className="actions"><select value={status} onChange={e=>setStatus(e.target.value as any)}><option>Pending</option><option>Paid</option></select><button onClick={save}>Save invoice</button></div>
      </div>

      <div className="card preview"><div className="invoice"><div className="invoiceTop"><div><strong>YOUR BUSINESS</strong><small>Professional invoice</small></div><h2>INVOICE</h2></div><hr/><div className="meta"><div><small>BILL TO</small><b>{customer||"Customer name"}</b><span>{phone||"Phone / WhatsApp"}</span></div><div><small>INVOICE</small><b>PREVIEW</b><span>{new Date().toLocaleDateString("en-SG")}</span></div></div>{items.map((it,i)=><div className="line" key={i}><span>{it.description||"Item"} × {it.qty}</span><b>{money(it.qty*it.price)}</b></div>)}<div className="invoiceTotal"><span>Total</span><b>{money(total)}</b></div></div></div>
    </section>

    <section className="card history"><div className="cardHead"><h2>Invoice history</h2><span>{invoices.length} saved</span></div>{invoices.length===0?<p className="muted">Saved invoices will appear here.</p>:invoices.map(x=><div className="historyRow" key={x.id}><b>{x.id}</b><span>{x.customer}</span><span>{money(x.items.reduce((s,i)=>s+i.qty*i.price,0)*(1+x.gst/100))}</span><span className={x.status==="Paid"?"paid":"pending"}>{x.status}</span></div>)}</section>
  </main>
}