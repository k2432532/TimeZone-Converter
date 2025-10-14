#!/bin/bash

# Security Audit Script for Smart TimeZone Converter Extension
# Version: 1.0
# This script checks for common security issues in Chrome extensions

echo "================================================"
echo "Security Audit - Smart TimeZone Converter v5.2.1"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ISSUES=0
WARNINGS=0
PASSED=0

# Function to check files
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((ISSUES++))
    fi
}

# Function to search for patterns
search_pattern() {
    local pattern=$1
    local description=$2
    local severity=$3
    
    echo -n "Checking for $description... "
    
    if grep -r "$pattern" --include="*.js" --include="*.html" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" > /dev/null; then
        if [ "$severity" == "error" ]; then
            echo -e "${RED}FOUND (Security Risk)${NC}"
            ((ISSUES++))
        else
            echo -e "${YELLOW}FOUND (Warning)${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    fi
}

echo "1. FILE STRUCTURE CHECK"
echo "-----------------------"
check_file "manifest.json" "Manifest file exists"
check_file "LICENSE" "License file exists"
check_file "README.md" "README file exists"
check_file "content/main.js" "Main content script exists"
check_file "ui/popup.html" "Popup HTML exists"
check_file "ui/tooltip.css" "Tooltip CSS exists"
echo ""

echo "2. MANIFEST SECURITY CHECK"
echo "---------------------------"
echo -n "Checking manifest version... "
if grep -q '"manifest_version": 3' manifest.json; then
    echo -e "${GREEN}PASS (Version 3)${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL (Should be Version 3)${NC}"
    ((ISSUES++))
fi

echo -n "Checking permissions... "
PERMS=$(grep -A5 '"permissions"' manifest.json)
if echo "$PERMS" | grep -q "tabs\|webRequest\|webRequestBlocking\|proxy"; then
    echo -e "${YELLOW}WARNING (Excessive permissions detected)${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
fi

echo -n "Checking CSP header... "
if grep -q "content_security_policy" manifest.json; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING (No CSP defined)${NC}"
    ((WARNINGS++))
fi
echo ""

echo "3. CODE SECURITY PATTERNS"
echo "--------------------------"
search_pattern "eval(" "eval() usage" "error"
search_pattern "innerHTML\s*=" "Direct innerHTML assignment" "warning"
search_pattern "document.write" "document.write usage" "error"
search_pattern "Function(" "Function constructor" "error"
search_pattern "setTimeout.*['\"]" "setTimeout with string" "warning"
search_pattern "setInterval.*['\"]" "setInterval with string" "warning"
search_pattern "\\.href\s*=" "Direct href assignment" "warning"
search_pattern "localStorage\." "localStorage usage" "warning"
search_pattern "http://" "Insecure HTTP references" "warning"
echo ""

echo "4. XSS PREVENTION CHECK"
echo "------------------------"
echo -n "Checking for HTML escaping... "
if grep -q "escapeHtml" content/main.js; then
    echo -e "${GREEN}PASS (escapeHtml function found)${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL (No HTML escaping found)${NC}"
    ((ISSUES++))
fi

echo -n "Checking for proper text content usage... "
if grep -q "textContent\|innerText" content/main.js; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC}"
    ((WARNINGS++))
fi
echo ""

echo "5. INPUT VALIDATION CHECK"
echo "--------------------------"
echo -n "Checking for input sanitization... "
if grep -q "trim()\|replace(" content/main.js; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC}"
    ((WARNINGS++))
fi

echo -n "Checking for max length limits... "
if grep -q "maxTextLength" content/main.js; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC}"
    ((WARNINGS++))
fi
echo ""

echo "6. EXTERNAL RESOURCE CHECK"
echo "---------------------------"
echo -n "Checking for external scripts... "
if grep -r "<script.*src=\"http" --include="*.html" . 2>/dev/null | grep -v "node_modules" > /dev/null; then
    echo -e "${RED}FAIL (External scripts found)${NC}"
    ((ISSUES++))
else
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
fi

echo -n "Checking for external stylesheets... "
if grep -r "<link.*href=\"http" --include="*.html" . 2>/dev/null | grep -v "node_modules" > /dev/null; then
    echo -e "${YELLOW}WARNING (External stylesheets found)${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
fi
echo ""

echo "7. PRIVACY CHECK"
echo "-----------------"
search_pattern "fetch\|XMLHttpRequest\|axios" "External API calls" "warning"
search_pattern "analytics\|ga\(" "Analytics tracking" "warning"
search_pattern "track\|telemetry" "Telemetry code" "warning"
echo ""

echo "================================================"
echo "AUDIT SUMMARY"
echo "================================================"
echo -e "${GREEN}Passed:${NC} $PASSED checks"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS potential improvements"
echo -e "${RED}Issues:${NC} $ISSUES security concerns"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ No critical security issues found!${NC}"
else
    echo -e "${RED}✗ Please address the security issues found above.${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Consider reviewing the warnings for better security.${NC}"
fi

echo ""
echo "Audit complete. Please review the results above."