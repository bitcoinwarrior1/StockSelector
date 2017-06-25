let request = require("superagent");
//all the s&p 500 companies
//TODO make companies dynamic
//TODO refactor
let companies = "MMM ACE ABT ANF ACN ADBE AMD AES AET AFL A GAS APD ARG AKAM AA ALXN ATI AGN ALL ANR ALTR MO AMZN AEE AEP AXP AIG AMT AMP ABC AMGN APH APC ADI AON APA AIV APOL AAPL AMAT ADM AIZ T ADSK ADP AN AZO AVB AVY AVP BHI BLL BAC BK BCR BAX BBT BEAM BDX BBBY BMS BRK.B BBY BIG BIIB BLK HRB BMC BA BWA BXP BSX BMY BRCM BF.B CHRW CA CVC COG CAM CPB COF CAH CFN KMX CCL CAT CBG CBS CELG CNP CTL CERN CF SCHW CHK CVX CMG CB CI CINF CTAS CSCO C CTXS CLF CLX CME CMS COH KO CCE CTSH CL CMCSA CMA CSC CAG COP CNX ED STZ CBE GLW COST CVH COV CCI CSX CMI CVS DHI DHR DRI DVA DF DE DELL DNR XRAY DVN DV DO DTV DFS DISCA DLTR D RRD DOV DOW DPS DTE DD DUK DNB ETFC EMN ETN EBAY ECL EIX EW EA EMC EMR ESV ETR EOG EQT EFX EQR EL EXC EXPE EXPD ESRX XOM FFIV FDO FAST FII FDX FIS FITB FHN FSLR FE FISV FLIR FLS FLR FMC FTI F FRX FOSL BEN FCX FTR GME GCI GPS GD GE GIS GPC GNW GILD GS GT GOOG GWW HAL HOG HAR HRS HIG HAS HCP HCN HNZ HP HES HPQ HD HON HRL HSP HST HCBK HUM HBAN ITW IR TEG INTC ICE IBM IFF IGT IP IPG INTU ISRG IVZ IRM JBL JEC JDSU JNJ JCI JOY JPM JNPR K KEY KMB KIM KMI KLAC KSS KFT KR LLL LH LRCX LM LEG LEN LUK LXK LIFE LLY LTD LNC LLTC LMT L LO LOW LSI MTB M MRO MPC MAR MMC MAS MA MAT MKC MCD MHP MCK MJN MWV MDT MRK MET PCS MCHP MU MSFT MOLX TAP MON MNST MCO MS MOS MSI MUR MYL NBR NDAQ NOV NTAP NFLX NWL NFX NEM NWSA NEE NKE NI NE NBL JWN NSC NTRS NOC NU NRG NUE NVDA NYX ORLY OXY OMC OKE ORCL OI PCAR PLL PH PDCO PAYX BTU JCP PBCT POM PEP PKI PRGO PFE PCG PM PSX PNW PXD PBI PCL PNC RL PPG PPL PX PCP PCLN PFG PG PGR PLD PRU PEG PSA PHM QEP PWR QCOM DGX RRC RTN RHT RF RSG RAI RHI ROK COL ROP ROST RDC R SWY SAI CRM SNDK SCG SLB SNI STX SEE SHLD SRE SHW SIAL SPG SLM SJM SNA SO LUV SWN SE S STJ SWK SPLS SBUX HOT STT SRCL SYK SUN STI SYMC SYY TROW TGT TEL TE THC TDC TER TSO TXN TXT HSY TRV TMO TIF TWX TWC TIE TJX TMK TSS TRIP TSN TYC USB UNP UNH UPS X UTX UNM URBN VFC VLO VAR VTR VRSN VZ VIAB V VNO VMC WMT WAG DIS WPO WM WAT WPI WLP WFC WDC WU WY WHR WFM WMB WIN WEC WPX WYN WYNN XEL XRX XLNX XL XYL YHOO YUM ZMH ZION";
let arrayOfCompanies = companies.split(" ");
let fs = require('fs');

/*
* Criteria:
* free cashflow must be positive
* return on equity: >12%
* return on assets: >8%
* Net profit margin: must be positive
*/

function getDataOnCompanies()
{
    for(company of arrayOfCompanies)
    {
        let symbol = company.replace(" ", "");

        request.get("http://financials.morningstar.com/ajax/exportKR2CSV.html?t=" + symbol, (err, data) =>
        {
            try
            {
                let result = data.text;
                if(result == "We’re sorry. There is no available information in our database to display.") return;
                let resultArray = result.split("\n");

                for(let i =0; i < resultArray.length; i++)
                {
                    if(resultArray[i].includes("Free Cash Flow/Net Income") && resultArray[i].includes("-"))
                    {
                        return;
                    }
                    else if(resultArray[i].includes("Return on Equity"))
                    {
                        if(!filterByCriteria(resultArray[i], 12)) return;
                    }
                    else if(resultArray[i].includes("Return on Assets"))
                    {
                        if(!filterByCriteria(resultArray[i], 8)) return;
                    }
                    else if(resultArray[i].includes("Net Margin %"))
                    {
                        //must be positive i.e. greater than 0
                        if(!filterByCriteria(resultArray[i], 0)) return;
                    }
                }
                //if it passes all the criteria then write to file
                writeToFile(result, symbol);
            }
            catch(exception)
            {
                console.log("error: " + exception);
                return exception;
            }
        });
    }
}


function writeToFile(text, symbol)
{
    console.log("company passes, symbol is: " + symbol);
    if(text.trim() == "") return;
    fs.writeFile("./companies/" + symbol + ".txt", text, function(err)
    {
        if(err) console.log(err);
        else console.log("company information saved to file");
    });
}

function filterByCriteria(results, percentageRequirement)
{
    let filteredResult = results.replace(/[^0-9.]/g, " ");
    let noWhiteSpace = filteredResult.toString().trim();
    let filteredNumbers = noWhiteSpace.split(" ");

    for(i=0; i < filteredNumbers.length; i++)
    {
        if(filteredNumbers[i] < percentageRequirement)
        {
            return false;
        }
    }
    return true;
}

getDataOnCompanies();