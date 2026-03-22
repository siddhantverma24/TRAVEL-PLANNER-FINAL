"""
Visa Route - Static Visa Database
"""
from flask import Blueprint, request, jsonify

visa_bp = Blueprint('visa', __name__)

# Comprehensive visa database for 7 passports × 15 US destinations
VISA_DATA = {
    # US Passport holders
    "US->US": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa required or applicable"},
    "US->UK": {"status": "VISA FREE", "label": "180 days visa-free (e-passport)", "duration": "6 months", "processing": "Automatic", "cost": "$0", "notes": "6 month visitor visa upon arrival"},
    "US->FR": {"status": "VISA FREE", "label": "Schengen Area", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "90 days in 180 days (Schengen)"},
    "US->DE": {"status": "VISA FREE", "label": "Schengen Area", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Part of Schengen agreement"},
    "US->IT": {"status": "VISA FREE", "label": "Schengen Area", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "European free movement"},
    "US->ES": {"status": "VISA FREE", "label": "Schengen Area", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "EU Schengen country"},
    "US->JP": {"status": "VISA FREE", "label": "Temporary Visitor", "duration": "90 days", "processing": "Automatic", "cost": "$0", "notes": "90-day tourist stay"},
    "US->AU": {"status": "VISA REQUIRED", "label": "eVisitor (600)", "duration": "12 months", "processing": "24-48 hours", "cost": "$20 AUD", "notes": "Available for US passport holders under reciprocal agreement"},
    "US->IN": {"status": "VISA REQUIRED", "label": "e-Visa", "duration": "60 days", "processing": "3-4 days", "cost": "$25-80", "notes": "Tourist or business e-visa"},
    "US->BR": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "90 days", "processing": "5-10 days", "cost": "$160", "notes": "Valid for 5 years, multiple entries"},
    "US->MX": {"status": "VISA FREE", "label": "Tourist Card", "duration": "180 days", "processing": "Automatic", "cost": "$0", "notes": "Free tourist card on arrival"},
    "US->CA": {"status": "VISA FREE", "label": "Visitor Status", "duration": "6 months", "processing": "Automatic", "cost": "$0", "notes": "6-month visitor permit on arrival"},
    "US->SG": {"status": "VISA FREE", "label": "30 days", "duration": "30 days", "processing": "Automatic", "cost": "$0", "notes": "Automatic arrival stamp"},
    "US->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "Tourist visa exempt"},
    "US->NZ": {"status": "VISA FREE", "label": "12 months", "duration": "12 months", "processing": "Automatic", "cost": "$0", "notes": "Electronic travel authority (NZeTA)"},
    
    # UK Passport holders
    "UK->US": {"status": "VISA REQUIRED", "label": "Visitor Visa or ESTA", "duration": "ESTA: 2 years", "processing": "ESTA: 24 hrs | Visa: 7-14 days", "cost": "ESTA: $14 | Visa: $160", "notes": "ESTA for visa-exempt travel"},
    "UK->UK": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa required"},
    "UK->FR": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Post-Brexit: STA travel needed"},
    "UK->DE": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "UK national card"},
    "UK->IT": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Unrestricted stay"},
    "UK->ES": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Tourism allowed"},
    "UK->JP": {"status": "VISA FREE", "label": "Temporary Visitor", "duration": "90 days", "processing": "Automatic", "cost": "$0", "notes": "British passport holders"},
    "UK->AU": {"status": "VISA REQUIRED", "label": "Visitor Visa (600)", "duration": "12 months", "processing": "24-48 hours", "cost": "$20 AUD", "notes": "eVisitor available"},
    "UK->IN": {"status": "VISA REQUIRED", "label": "e-Visa", "duration": "60 days", "processing": "3-4 days", "cost": "$25-80", "notes": "Tourist e-visa"},
    "UK->BR": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "90 days", "processing": "5-10 days", "cost": "$190", "notes": "5-year valid multiple entry"},
    "UK->MX": {"status": "VISA FREE", "label": "Tourist Card", "duration": "180 days", "processing": "Automatic", "cost": "$0", "notes": "British passport accepted"},
    "UK->CA": {"status": "VISA FREE", "label": "Visitor Status", "duration": "6 months", "processing": "Automatic", "cost": "$0", "notes": "ETA available online"},
    "UK->SG": {"status": "VISA FREE", "label": "30 days", "duration": "30 days", "processing": "Automatic", "cost": "$0", "notes": "Automatic entry"},
    "UK->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "UK visitor"},
    "UK->NZ": {"status": "VISA FREE", "label": "12 months", "duration": "12 months", "processing": "Automatic", "cost": "$0", "notes": "NZeTA online"},
    
    # Japanese Passport holders
    "JP->US": {"status": "VISA REQUIRED", "label": "Visitor Visa or ESTA", "duration": "ESTA: 2 years", "processing": "ESTA: 24hrs | Visa: 7-14 days", "cost": "ESTA: $14 | Visa: $160", "notes": "Japanese citizens eligible for ESTA"},
    "JP->UK": {"status": "VISA FREE", "label": "6 months", "duration": "6 months", "processing": "N/A", "cost": "$0", "notes": "Standard visitor visa"},
    "JP->FR": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Japanese passport"},
    "JP->DE": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "90 in 180 days"},
    "JP->IT": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Tourist stay"},
    "JP->ES": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Spain Schengen"},
    "JP->JP": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa needed"},
    "JP->AU": {"status": "VISA REQUIRED", "label": "Visitor eVisitor", "duration": "12 months", "processing": "24 hours", "cost": "$20 AUD", "notes": "Multiple entries allowed"},
    "JP->IN": {"status": "VISA REQUIRED", "label": "e-Visa", "duration": "60 days", "processing": "3-4 days", "cost": "$25-80", "notes": "Quick processing"},
    "JP->BR": {"status": "VISA FREE", "label": "90 days visa-free", "duration": "90 days", "processing": "Automatic", "cost": "$0", "notes": "Free entry for Japanese"},
    "JP->MX": {"status": "VISA FREE", "label": "180 days", "duration": "180 days", "processing": "Automatic", "cost": "$0", "notes": "Long term visa-free"},
    "JP->CA": {"status": "VISA FREE", "label": "Visitor Status", "duration": "6 months", "processing": "Automatic", "cost": "$0", "notes": "ETA online"},
    "JP->SG": {"status": "VISA FREE", "label": "30 days", "duration": "30 days", "processing": "Automatic", "cost": "$0", "notes": "Japanese nationals"},
    "JP->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "Thai reciprocal"},
    "JP->NZ": {"status": "VISA FREE", "label": "12 months", "duration": "12 months", "processing": "Automatic", "cost": "$0", "notes": "NZeTA online"},
    
    # Indian Passport holders
    "IN->US": {"status": "VISA REQUIRED", "label": "Non-immigrant Visa", "duration": "10 years", "processing": "7-14 days", "cost": "$160-260", "notes": "B1/B2 tourist/business visa"},
    "IN->UK": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "6 months", "processing": "3-5 days", "cost": "₹1,360-3,408", "notes": "Standard tourist visa"},
    "IN->FR": {"status": "VISA REQUIRED", "label": "Schengen Visa", "duration": "90 days", "processing": "5-10 days", "cost": "€80", "notes": "French Schengen"},
    "IN->DE": {"status": "VISA REQUIRED", "label": "Schengen Visa", "duration": "90 days", "processing": "7-10 days", "cost": "€80", "notes": "German processing"},
    "IN->IT": {"status": "VISA REQUIRED", "label": "Schengen Visa", "duration": "90 days", "processing": "5-10 days", "cost": "€80", "notes": "Italian visa center"},
    "IN->ES": {"status": "VISA REQUIRED", "label": "Schengen Visa", "duration": "90 days", "processing": "7-10 days", "cost": "€80", "notes": "Spanish Schengen"},
    "IN->JP": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "90 days", "processing": "4-5 days", "cost": "$11-19", "notes": "Single or multiple entry"},
    "IN->AU": {"status": "VISA REQUIRED", "label": "Visitor (600)", "duration": "12 months", "processing": "24-48 hours", "cost": "$20 AUD", "notes": "Online eVisitor"},
    "IN->IN": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa needed"},
    "IN->BR": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "90 days", "processing": "10-15 days", "cost": "$100-200", "notes": "Brazil visa required"},
    "IN->MX": {"status": "VISA REQUIRED", "label": "Tourist Card", "duration": "180 days", "processing": "Automatic", "cost": "$0", "notes": "Card issued on arrival"},
    "IN->CA": {"status": "VISA REQUIRED", "label": "eTA/Visitor Visa", "duration": "up to 6 months", "processing": "24-48 hours", "cost": "CAD $7 (eTA)", "notes": "Online eTA available"},
    "IN->SG": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "30 days", "processing": "3-4 days", "cost": "$20-30", "notes": "Quick processing"},
    "IN->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "Mutual exemption"},
    "IN->NZ": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "3 months", "processing": "5-10 days", "cost": "NZD $165", "notes": "Indian friendly"},
    
    # Brazilian Passport holders
    "BR->US": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "10 years", "processing": "7-14 days", "cost": "$160", "notes": "Multiple entry B1/B2"},
    "BR->UK": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "6 months", "processing": "3-5 days", "cost": "£5-9", "notes": "UK visa required"},
    "BR->FR": {"status": "VISA REQUIRED", "label": "Schengen", "duration": "90 days", "processing": "10-15 days", "cost": "€80", "notes": "French Schengen"},
    "BR->DE": {"status": "VISA REQUIRED", "label": "Schengen", "duration": "90 days", "processing": "5-10 days", "cost": "€80", "notes": "German Schengen"},
    "BR->IT": {"status": "VISA REQUIRED", "label": "Schengen", "duration": "90 days", "processing": "5-10 days", "cost": "€80", "notes": "Italy"},
    "BR->ES": {"status": "VISA REQUIRED", "label": "Schengen", "duration": "90 days", "processing": "5-10 days", "cost": "€80", "notes": "Spain Schengen"},
    "BR->JP": {"status": "VISA FREE", "label": "90 days", "duration": "90 days", "processing": "Automatic", "cost": "$0", "notes": "Japanese reciprocal"},
    "BR->AU": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "12 months", "processing": "5-10 days", "cost": "AUD $145", "notes": "Standard visitor"},
    "BR->IN": {"status": "VISA REQUIRED", "label": "e-Visa", "duration": "60 days", "processing": "3-4 days", "cost": "₹2,000-3,000", "notes": "Tourist e-visa"},
    "BR->BR": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa needed"},
    "BR->MX": {"status": "VISA REQUIRED", "label": "Temporary Resident", "duration": "180 days", "processing": "Automatic", "cost": "$0-30", "notes": "Often granted on arrival"},
    "BR->CA": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "6 months", "processing": "4-6 weeks", "cost": "CAD $100", "notes": "Online application"},
    "BR->SG": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "30 days", "processing": "3-7 days", "cost": "$30-50", "notes": "Fast processing"},
    "BR->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "Extended tourist"},
    "BR->NZ": {"status": "VISA REQUIRED", "label": "Visitor Visa", "duration": "3 months", "processing": "5-10 days", "cost": "NZD $165", "notes": "Standard tourist"},
    
    # Canadian Passport holders
    "CA->US": {"status": "VISA FREE", "label": "180+ days", "duration": "6+ months", "processing": "Automatic", "cost": "$0", "notes": "No visa for Canadian citizens"},
    "CA->UK": {"status": "VISA FREE", "label": "6 months", "duration": "6 months", "processing": "Automatic", "cost": "$0", "notes": "Commonwealth citizen"},
    "CA->FR": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "90 in 180"},
    "CA->DE": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Canadian passport"},
    "CA->IT": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Italy"},
    "CA->ES": {"status": "VISA FREE", "label": "Schengen", "duration": "90 days", "processing": "N/A", "cost": "$0", "notes": "Spain"},
    "CA->JP": {"status": "VISA FREE", "label": "90 days", "duration": "90 days", "processing": "Automatic", "cost": "$0", "notes": "Temporary visitor"},
    "CA->AU": {"status": "VISA REQUIRED", "label": "Visitor eVisitor", "duration": "12 months", "processing": "24-48 hours", "cost": "$20 AUD", "notes": "Multiple entries"},
    "CA->IN": {"status": "VISA REQUIRED", "label": "e-Visa", "duration": "60 days", "processing": "3-4 days", "cost": "$25-80", "notes": "Canadian"},
    "CA->BR": {"status": "VISA REQUIRED", "label": "Tourist Visa", "duration": "90 days", "processing": "5-10 days", "cost": "CAD $100-130", "notes": "Canadian processing"},
    "CA->MX": {"status": "VISA FREE", "label": "180 days", "duration": "180 days", "processing": "Automatic", "cost": "$0", "notes": "Standard tourist"},
    "CA->CA": {"status": "N/A", "label": "Domestic Travel", "duration": "N/A", "processing": "N/A", "cost": "$0", "notes": "No visa needed"},
    "CA->SG": {"status": "VISA FREE", "label": "30 days", "duration": "30 days", "processing": "Automatic", "cost": "$0", "notes": "Canadian passport"},
    "CA->TH": {"status": "VISA FREE", "label": "60 days", "duration": "60 days", "processing": "Automatic", "cost": "$0", "notes": "Tourist entry"},
    "CA->NZ": {"status": "VISA FREE", "label": "12 months", "duration": "12 months", "processing": "Automatic", "cost": "$0", "notes": "NZeTA online"},
}

@visa_bp.route('/', methods=['GET'])
def check_visa():
    try:
        from_country = request.args.get('from', '').upper()
        to_country = request.args.get('to', '').upper()
        
        if not (from_country and to_country):
            return jsonify({"error": "from and to parameters required"}), 400
        
        # Lookup visa
        key = f"{from_country}->{to_country}"
        if key in VISA_DATA:
            return jsonify({"country": key, **VISA_DATA[key]})
        
        # Country not in database
        return jsonify({"error": "Visa information not available for this country pair"}), 404
        
    except Exception as e:
        print(f"[ERROR] visa route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@visa_bp.route('/countries', methods=['GET'])
def get_countries():
    # Return list of supported countries
    countries = set()
    for key in VISA_DATA.keys():
        from_c, to_c = key.split('->')
        countries.add(from_c)
        countries.add(to_c)
    
    return jsonify({
        "countries": sorted(list(countries)),
        "count": len(countries)
    })
