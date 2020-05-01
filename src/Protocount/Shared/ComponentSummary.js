//Dashboard
import Dashboard from '../Dashboard/Dashboard';
import DashboardSVG from './svg/030-presentation.svg';

//Sales
import DeliveryOrder from '../Sales/DeliveryOrder';
import DeliveryReturn from '../Sales/DeliveryReturn';
import SalesInvoice from '../Sales/SalesInvoice';
import DebitNote from '../Sales/DebitNote';
import CreditNote from '../Sales/CreditNote';
import SalesReport from '../Sales/SalesReport';
import DeliveryOrderItem from '../Sales/DeliveryOrderItem';
import DeliveryReturnItem from '../Sales/DeliveryReturnItem';
import SalesInvoiceItem from '../Sales/SalesInvoiceItem';
import DebitNoteItem from '../Sales/DebitNoteItem';
import CreditNoteItem from '../Sales/CreditNoteItem';
import SalesSVG from './svg/006-call.svg';


//Purchase
import GoodsReceivedNote from '../Purchase/GoodsReceivedNote';
import PurchaseReturn from '../Purchase/PurchaseReturn';
import PurchaseInvoice from '../Purchase/PurchaseInvoice';
import PurchaseDebitNote from '../Purchase/PurchaseDebitNote';
import PurchaseCreditNote from '../Purchase/PurchaseCreditNote';
import PurchaseReport from '../Purchase/PurchaseReport';
import GoodsReceivedNoteItem from '../Purchase/GoodsReceivedNoteItem';
import PurchaseReturnItem from '../Purchase/PurchaseReturnItem';
import PurchaseInvoiceItem from '../Purchase/PurchaseInvoiceItem';
import PurchaseDebitNoteItem from '../Purchase/PurchaseDebitNoteItem';
import PurchaseCreditNoteItem from '../Purchase/PurchaseCreditNoteItem';
import PurchaseSVG from './svg/009-conversation.svg';

//Inventory
import StockItemMaintenance from '../Inventory/StockItemMaintenance';
import StockAdjustment from '../Inventory/StockAdjustment';
import StockCardReport from '../Inventory/StockCardReport';
import StockItem from '../Inventory/StockItem';
import StockAdjustmentItem from '../Inventory/StockAdjustmentItem';
import InventorySVG from './svg/020-folders.svg';

//BankAndCash
import BankMaintenance from '../BankAndCash/BankMaintenance';
import BankReceipt from '../BankAndCash/BankReceipt';
import BankPayment from '../BankAndCash/BankPayment';
import CashReceipt from '../BankAndCash/CashReceipt';
import CashPayment from '../BankAndCash/CashPayment';
import BankItem from '../BankAndCash/BankItem';
import BankReceiptItem from '../BankAndCash/BankReceiptItem';
import BankPaymentItem from '../BankAndCash/BankPaymentItem';
import CashReceiptItem from '../BankAndCash/CashReceiptItem';
import CashPaymentItem from '../BankAndCash/CashPaymentItem';
import BankAndCashSVG from './svg/027-money.svg';

//AccountsReceivable
import DebtorMaintenance from '../AccountsReceivable/DebtorMaintenance';
import DebtorAgingReport from '../AccountsReceivable/DebtorAgingReport';
import DebtorStatementReport from '../AccountsReceivable/DebtorStatementReport';
import DebtorCollectionReport from '../AccountsReceivable/DebtorCollectionReport';
import DebtorItem from '../AccountsReceivable/DebtorItem';
import AccountsReceivableSVG from './svg/011-calendar.svg';

//AccountsPayable
import CreditorMaintenance from '../AccountsPayable/CreditorMaintenance';
import CreditorAgingReport from '../AccountsPayable/CreditorAgingReport';
import CreditorStatementReport from '../AccountsPayable/CreditorStatementReport';
import CreditorItem from '../AccountsPayable/CreditorItem';
import AccountsPayableSVG from './svg/017-send.svg';

//GeneralLedger
import AccountMaintenance from '../GeneralLedger/AccountMaintenance';
import JournalEntry from '../GeneralLedger/JournalEntry';
import ProfitAndLoss from '../GeneralLedger/ProfitAndLoss';
import BalanceSheet from '../GeneralLedger/BalanceSheet';
import JournalItem from '../GeneralLedger/JournalItem';
import ProfitAndLossItem from '../GeneralLedger/ProfitAndLossItem';
import BalanceSheetItem from '../GeneralLedger/BalanceSheetItem';
import GeneralLedgerSVG from './svg/015-contact.svg';
/*
ComponentSummary module is a collection of all components used in this App arranged in a useful way and used as dependency in other 
areas of App. It is an array of objects (categories) which contained process (ie Delivery Order),
item (ie Delivery Order Item) and report(ie SalesReport.js) components. It is used as a dependency for App.js for automatic 
creation of <Route>s with their respective components (ie. DeliveryOrder.js, DeliveryOrderItem.js, SalesReport.js). Also used as 
dependency for automatic population of navigation items in <SidePanel> and <SubPanel>. 

If in the future need to add App functionality, update this module. 

Each objects(categories) are arranged in sequence (ie Dashboard, Sales, Purchase) similar to file directory structure in
order they will appear in Side Panel.The process/report components (excluding item components) in each category are also 
arranged in sequence in the order they appear in the Subpanels. **Note path string (ie DeliveryOrder.path='DeliveryOrder') 
properties of each component used to populate <Route> in App.js are already set in their respective module as property of the component itself.
Same with description string (ie DeliveryOrder.description='Delivery Order') used for Subpanels 
*/ 

//NO SPACE BETWEEN NAMES! as they are used for keys and spaces have unpredictable behaviors (i.e. Accounts Receivable should be Accounts-Receivable)
const ComponentSummary = [ 
    {name:'Dashboard',svg:DashboardSVG ,process:[Dashboard], item:[], report:[]},
    {name:'Sales',svg:SalesSVG ,process:[DeliveryOrder,DeliveryReturn,SalesInvoice,DebitNote,CreditNote], item:[DeliveryOrderItem,DeliveryReturnItem,SalesInvoiceItem,DebitNoteItem,CreditNoteItem], report:[SalesReport]},
    {name:'Purchase',svg:PurchaseSVG ,process:[GoodsReceivedNote,PurchaseReturn,PurchaseInvoice,PurchaseDebitNote,PurchaseCreditNote], item:[GoodsReceivedNoteItem,PurchaseReturnItem,PurchaseInvoiceItem,PurchaseDebitNoteItem,PurchaseCreditNoteItem], report:[PurchaseReport]},
    {name:'Inventory',svg:InventorySVG ,process:[StockItemMaintenance,StockAdjustment], item:[StockItem,StockAdjustmentItem], report:[StockCardReport]},
    {name:'Bank and Cash',svg:BankAndCashSVG ,process:[BankMaintenance,BankReceipt,BankPayment,CashReceipt,CashPayment], item:[BankItem,BankReceiptItem,BankPaymentItem,CashReceiptItem,CashPaymentItem], report:[]},
    {name:'Accounts Receivable',svg:AccountsReceivableSVG ,process:[DebtorMaintenance], item:[DebtorItem], report:[DebtorAgingReport,DebtorStatementReport,DebtorCollectionReport]},
    {name:'Accounts Payable',svg:AccountsPayableSVG ,process:[CreditorMaintenance], item:[CreditorItem], report:[CreditorAgingReport,CreditorStatementReport]},
    {name:'General Ledger',svg:GeneralLedgerSVG ,process:[AccountMaintenance,JournalEntry,ProfitAndLoss,BalanceSheet], item:[JournalItem,ProfitAndLossItem,BalanceSheetItem], report:[]},
]

export default ComponentSummary;