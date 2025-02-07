import React, { useEffect } from "react";

interface AffordabilityWidgetProps {
  key: string;
  amount: number;
}

// Declare the global payuAffordability object
declare global {
  interface Window {
    payuAffordability: {
      init: (config: { key: string; amount: number }) => void;
    };
  }
}

const AffordabilityWidget: React.FC<AffordabilityWidgetProps> = ({ key, amount }) => {
  const loadWidget = (): void => {
    const widgetConfig = { key, amount };
    window.payuAffordability.init(widgetConfig);
  };

  const appendScript = (): void => {
    let myScript = document.getElementById("payu-affordability-widget") as HTMLScriptElement | null;
    
    if (!myScript) {
      myScript = document.createElement("script");
      myScript.setAttribute(
        "src",
        "https://jssdk.payu.in/widget/affordability-widget.min.js"
      );
      myScript.id = "payu-affordability-widget";
      document.body.appendChild(myScript);
    }
    
    myScript.addEventListener("load", loadWidget, true);
  };

  useEffect(() => {
    appendScript();
    // Empty dependency array since we only want this to run once
  }, []);

  return <div id="payuWidget" />;
};

export default AffordabilityWidget;