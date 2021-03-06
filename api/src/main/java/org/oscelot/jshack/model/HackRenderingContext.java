package org.oscelot.jshack.model;

import org.oscelot.jshack.resources.HackResource;

import java.util.List;
import java.util.Map;

/**
 * Created by wiley on 20/07/14.<br>
 * The HackRenderingContext encapsulates all the information required to render the hacks
 * in a RenderingHook at a given point in time.  It is generated by calling HackManager.getRenderingContext()
 */

public class HackRenderingContext {
    /** Resources to render on the page */
    private List<HackResource> resources;

    /** Map of config entries keyed by Hack ID */
    private Map<String, Map<String, String>> hackConfigMaps;

    /** Map of Resource URL entries keyed by Hack ID */
    private Map<String, Map<String, String>> resourceUrlMaps;


    public List<HackResource> getResources() {
        return resources;
    }

    public void setResources(List<HackResource> resources) {
        this.resources = resources;
    }

    public Map<String, Map<String, String>> getHackConfigMaps() {
        return hackConfigMaps;
    }

    public void setHackConfigMaps(Map<String, Map<String, String>> hackConfigMaps) {
        this.hackConfigMaps = hackConfigMaps;
    }

    public Map<String, Map<String, String>> getResourceUrlMaps() {
        return resourceUrlMaps;
    }

    public void setResourceUrlMaps(Map<String, Map<String, String>> resourceUrlMaps) {
        this.resourceUrlMaps = resourceUrlMaps;
    }
}
